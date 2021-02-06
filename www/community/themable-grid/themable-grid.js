(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ThemableGrid = factory());
}(this, (function () { 'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function empty() {
        return text('');
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set($$props) {
                if (this.$$set && !is_empty($$props)) {
                    this.$$.skip_bound = true;
                    this.$$set($$props);
                    this.$$.skip_bound = false;
                }
            }
        };
    }

    function hass() {
      if(document.querySelector('hc-main'))
        return document.querySelector('hc-main').hass;

      if(document.querySelector('home-assistant'))
        return document.querySelector('home-assistant').hass;

      return undefined;
    }
    function lovelace() {
      var root = document.querySelector("hc-main");
      if(root) {
        var ll = root._lovelaceConfig;
        ll.current_view = root._lovelacePath;
        return ll;
      }

      root = document.querySelector("home-assistant");
      root = root && root.shadowRoot;
      root = root && root.querySelector("home-assistant-main");
      root = root && root.shadowRoot;
      root = root && root.querySelector("app-drawer-layout partial-panel-resolver");
      root = root && root.shadowRoot || root;
      root = root && root.querySelector("ha-panel-lovelace");
      root = root && root.shadowRoot;
      root = root && root.querySelector("hui-root");
      if (root) {
        var ll =  root.lovelace;
        ll.current_view = root.___curView;
        return ll;
      }

      return null;
    }
    function lovelace_view() {
      var root = document.querySelector("hc-main");
      if(root) {
        root = root && root.shadowRoot;
        root = root && root.querySelector("hc-lovelace");
        root = root && root.shadowRoot;
        root = root && root.querySelector("hui-view") || root.querySelector("hui-panel-view");
        return root;
      }

      root = document.querySelector("home-assistant");
      root = root && root.shadowRoot;
      root = root && root.querySelector("home-assistant-main");
      root = root && root.shadowRoot;
      root = root && root.querySelector("app-drawer-layout partial-panel-resolver");
      root = root && root.shadowRoot || root;
      root = root && root.querySelector("ha-panel-lovelace");
      root = root && root.shadowRoot;
      root = root && root.querySelector("hui-root");
      root = root && root.shadowRoot;
      root = root && root.querySelector("ha-app-layout");
      root = root && root.querySelector("#view");
      root = root && root.firstElementChild;
      return root;
    }

    async function load_lovelace() {
      if(customElements.get("hui-view")) return true;

      await customElements.whenDefined("partial-panel-resolver");
      const ppr = document.createElement("partial-panel-resolver");
      ppr.hass = {panels: [{
        url_path: "tmp",
        "component_name": "lovelace",
      }]};
      ppr._updateRoutes();
      await ppr.routerOptions.routes.tmp.load();
      if(!customElements.get("ha-panel-lovelace")) return false;
      const p = document.createElement("ha-panel-lovelace");
      p.hass = hass();
      if(p.hass === undefined) {
        await new Promise(resolve => {
          window.addEventListener('connection-status', (ev) => {
            console.log(ev);
            resolve();
          }, {once: true});
        });
        p.hass = hass();
      }
      p.panel = {config: {mode: null}};
      p._fetchConfig();
      return true;
    }

    function fireEvent(ev, detail, entity=null) {
      ev = new Event(ev, {
        bubbles: true,
        cancelable: false,
        composed: true,
      });
      ev.detail = detail || {};
      if(entity) {
        entity.dispatchEvent(ev);
      } else {
        var root = lovelace_view();
        if (root) root.dispatchEvent(ev);
      }
    }

    const CUSTOM_TYPE_PREFIX = "custom:";

    let helpers = window.cardHelpers;
    const helperPromise = new Promise(async (resolve, reject) => {
      if(helpers) resolve();

      const updateHelpers = async () => {
        helpers = await window.loadCardHelpers();
        window.cardHelpers = helpers;
        resolve();
      };

      if(window.loadCardHelpers) {
        updateHelpers();
      } else {
        // If loadCardHelpers didn't exist, force load lovelace and try once more.
        window.addEventListener("load", async () => {
          load_lovelace();
          if(window.loadCardHelpers) {
            updateHelpers();
          }
        });
      }
    });

    function errorElement(error, origConfig) {
      const cfg = {
        type: "error",
        error,
        origConfig,
      };
      const el = document.createElement("hui-error-card");
      customElements.whenDefined("hui-error-card").then(() => {
        const newel = document.createElement("hui-error-card");
        newel.setConfig(cfg);
        if(el.parentElement)
          el.parentElement.replaceChild(newel, el);
      });
      helperPromise.then(() => {
        fireEvent("ll-rebuild", {}, el);
      });
      return el;
    }

    function _createElement(tag, config) {
      let el = document.createElement(tag);
      try {
        el.setConfig(JSON.parse(JSON.stringify(config)));
      } catch (err) {
        el = errorElement(err, config);
      }
      helperPromise.then(() => {
        fireEvent("ll-rebuild", {}, el);
      });
      return el;
    }

    function createLovelaceElement(thing, config) {
      if(!config || typeof config !== "object" || !config.type)
        return errorElement(`No ${thing} type configured`, config);

      let tag = config.type;
      if(tag.startsWith(CUSTOM_TYPE_PREFIX))
        tag = tag.substr(CUSTOM_TYPE_PREFIX.length);
      else
        tag = `hui-${tag}-${thing}`;

      if(customElements.get(tag))
        return _createElement(tag, config);

      const el = errorElement(`Custom element doesn't exist: ${tag}.`, config);
      el.style.display = "None";

      const timer = setTimeout(() => {
        el.style.display = "";
      }, 2000);

      customElements.whenDefined(tag).then(() => {
        clearTimeout(timer);
        fireEvent("ll-rebuild", {}, el);
      });

      return el;
    }

    function createCard(config) {
      if(helpers) return helpers.createCardElement(config);
      return createLovelaceElement('card', config);
    }

    function isObject (o) {
      return !!o && o.constructor === Object
    }

    function setStyle (node, prop, value) {
      if (node.style[prop] !== value) {
        node.style[prop] = value;
      }
    }

    function applyStyles (node, styles, breakpoint) {
      if (isObject(styles)) {
        Object.entries(styles).forEach(([prop, value]) => {
          if (isObject(value)) {
            if (value.hasOwnProperty(breakpoint)) {
              setStyle(node, prop, value[breakpoint]);
            }
          } else {
            setStyle(node, prop, value);
          }
        });
      }
    }

    /* src/Card.svelte generated by Svelte v3.31.0 */

    function create_fragment(ctx) {
    	let div;
    	let uplift_action;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			this.c = noop;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(uplift_action = /*uplift*/ ctx[2].call(null, div, {
    					type: /*type*/ ctx[0],
    					hass: /*hass*/ ctx[1]
    				}));

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (uplift_action && is_function(uplift_action.update) && dirty & /*type, hass*/ 3) uplift_action.update.call(null, {
    				type: /*type*/ ctx[0],
    				hass: /*hass*/ ctx[1]
    			});
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { type = "div" } = $$props;
    	let { config = {} } = $$props;
    	let { hass } = $$props;
    	let { breakpoint } = $$props;

    	function uplift(node) {
    		// content will only be defined after the first render, so all logic can be done in update
    		return {
    			update({ hass }) {
    				const { grid, ...rest } = config;
    				applyStyles(node, grid, breakpoint);

    				if (node?.firstChild?.tagName) {
    					node.firstChild.hass = hass;
    					return;
    				}

    				const el = createCard(rest);
    				el.hass = hass;
    				node?.replaceChildren(el);
    			}
    		};
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    		if ("hass" in $$props) $$invalidate(1, hass = $$props.hass);
    		if ("breakpoint" in $$props) $$invalidate(4, breakpoint = $$props.breakpoint);
    	};

    	return [type, hass, uplift, config, breakpoint];
    }

    class Card extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes)
    			},
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				type: 0,
    				config: 3,
    				hass: 1,
    				breakpoint: 4
    			}
    		);

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["type", "config", "hass", "breakpoint"];
    	}

    	get type() {
    		return this.$$.ctx[0];
    	}

    	set type(type) {
    		this.$set({ type });
    		flush();
    	}

    	get config() {
    		return this.$$.ctx[3];
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}

    	get hass() {
    		return this.$$.ctx[1];
    	}

    	set hass(hass) {
    		this.$set({ hass });
    		flush();
    	}

    	get breakpoint() {
    		return this.$$.ctx[4];
    	}

    	set breakpoint(breakpoint) {
    		this.$set({ breakpoint });
    		flush();
    	}
    }

    customElements.define("themable-grid-card", Card);

    var defaultConfig = {
      padding: 0,
      gap: '8px',
      breakpoints: [
        {
          name: 'mobile',
          mq: '(max-width: 767px)',
          columns: 1,
        }, {
          name: 'tablet',
          mq: '(min-width: 768px) and (max-width: 1023px)',
          columns: 2,
        }, {
          name: 'desktop',
          mq: '(min-width: 1024px)',
          columns: 3,
        }
      ]
    };

    /* src/ThemableGrid.svelte generated by Svelte v3.31.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (58:2) {#if data}
    function create_if_block(ctx) {
    	let section;
    	let current;
    	let if_block = /*data*/ ctx[4].cards && create_if_block_1(ctx);

    	return {
    		c() {
    			section = element("section");
    			if (if_block) if_block.c();
    			set_style(section, "--columns", /*columns*/ ctx[2]);
    			set_style(section, "--gap", /*data*/ ctx[4].gap);
    			set_style(section, "--padding", /*data*/ ctx[4].padding);
    		},
    		m(target, anchor) {
    			insert(target, section, anchor);
    			if (if_block) if_block.m(section, null);
    			/*section_binding*/ ctx[7](section);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*data*/ ctx[4].cards) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(section, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*columns*/ 4) {
    				set_style(section, "--columns", /*columns*/ ctx[2]);
    			}

    			if (!current || dirty & /*data*/ 16) {
    				set_style(section, "--gap", /*data*/ ctx[4].gap);
    			}

    			if (!current || dirty & /*data*/ 16) {
    				set_style(section, "--padding", /*data*/ ctx[4].padding);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(section);
    			if (if_block) if_block.d();
    			/*section_binding*/ ctx[7](null);
    		}
    	};
    }

    // (66:4) {#if data.cards}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[4].cards;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*hass, data, breakpoint*/ 25) {
    				each_value = /*data*/ ctx[4].cards;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (67:4) {#each data.cards as card, index}
    function create_each_block(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				hass: /*hass*/ ctx[0],
    				config: /*card*/ ctx[10],
    				breakpoint: /*breakpoint*/ ctx[3]
    			}
    		});

    	return {
    		c() {
    			create_component(card.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const card_changes = {};
    			if (dirty & /*hass*/ 1) card_changes.hass = /*hass*/ ctx[0];
    			if (dirty & /*data*/ 16) card_changes.config = /*card*/ ctx[10];
    			if (dirty & /*breakpoint*/ 8) card_changes.breakpoint = /*breakpoint*/ ctx[3];

    			if (dirty & /*$$scope*/ 8192) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(card, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let main;
    	let current;
    	let if_block = /*data*/ ctx[4] && create_if_block(ctx);

    	return {
    		c() {
    			main = element("main");
    			if (if_block) if_block.c();
    			this.c = noop;
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*data*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { hass } = $$props;
    	let wrapper;
    	let config = {};
    	let columns = 1;
    	let breakpoint;
    	const lovelace$1 = lovelace();

    	function setConfig(conf = {}) {
    		$$invalidate(6, config = { ...defaultConfig, ...conf });
    	}

    	function handleBreakpoint(cols, name) {
    		return e => {
    			if (e.matches) {
    				$$invalidate(2, columns = cols);
    				$$invalidate(3, breakpoint = name);
    			}
    		};
    	}

    	onMount(async () => {
    		await tick();

    		Object.values(data.breakpoints).forEach(({ name, mq, columns }) => {
    			const e = window.matchMedia(mq);
    			const fn = handleBreakpoint(columns, name);
    			e.addListener(fn);
    			fn(e);
    		});
    	});

    	function section_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrapper = $$value;
    			$$invalidate(1, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("hass" in $$props) $$invalidate(0, hass = $$props.hass);
    	};

    	let data;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*config*/ 64) {
    			 $$invalidate(4, data = {
    				...config,
    				...lovelace$1?.config?.themable_grid ?? {}
    			});
    		}
    	};

    	return [hass, wrapper, columns, breakpoint, data, setConfig, config, section_binding];
    }

    class ThemableGrid extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>section{display:grid;grid-template-columns:repeat(var(--columns, 1), 1fr);grid-gap:var(--gap, 8px);padding:var(--padding, 8px)}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes)
    			},
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{ hass: 0, setConfig: 5 }
    		);

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["hass", "setConfig"];
    	}

    	get hass() {
    		return this.$$.ctx[0];
    	}

    	set hass(hass) {
    		this.$set({ hass });
    		flush();
    	}

    	get setConfig() {
    		return this.$$.ctx[5];
    	}
    }

    customElements.define("themable-grid", ThemableGrid);

    window.customCards = window.customCards || [];
    window.customCards.push({
      type: 'themable-grid',
      name: 'Themable Grid',
      preview: false,
      description: 'Themable grid',
    });

    return ThemableGrid;

})));
