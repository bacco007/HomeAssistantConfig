(function(x,T){typeof exports=="object"&&typeof module<"u"?module.exports=T():typeof define=="function"&&define.amd?define(T):(x=typeof globalThis<"u"?globalThis:x||self,x.ExpanderCard=T())})(this,function(){"use strict";var pi=Object.defineProperty;var Fn=x=>{throw TypeError(x)};var gi=(x,T,q)=>T in x?pi(x,T,{enumerable:!0,configurable:!0,writable:!0,value:q}):x[T]=q;var Y=(x,T,q)=>gi(x,typeof T!="symbol"?T+"":T,q),Hn=(x,T,q)=>T.has(x)||Fn("Cannot "+q);var I=(x,T,q)=>(Hn(x,T,"read from private field"),q?q.call(x):T.get(x)),Lt=(x,T,q)=>T.has(x)?Fn("Cannot add the same private member more than once"):T instanceof WeakSet?T.add(x):T.set(x,q),Dt=(x,T,q,Be)=>(Hn(x,T,"write to private field"),Be?Be.call(x,q):T.set(x,q),q);var G,j;const x="5";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(x);const T=1,q=2,Be=16,jn=1,Bn=2,Un=4,Yn=8,Vn=16,Wn=4,Kn=1,zn=2,Mt="[",ft="[!",ct="]",Ae={},L=Symbol(),Gn="http://www.w3.org/2000/svg",Ft=!1;function dt(e){console.warn("hydration_mismatch")}var vt=Array.isArray,ht=Array.from,Ue=Object.keys,Ye=Object.defineProperty,oe=Object.getOwnPropertyDescriptor,Ht=Object.getOwnPropertyDescriptors,Xn=Object.prototype,Jn=Array.prototype,Ve=Object.getPrototypeOf;function Zn(e){return typeof e=="function"}const We=()=>{};function Qn(e){return e()}function _t(e){for(var t=0;t<e.length;t++)e[t]()}const K=2,jt=4,ve=8,pt=16,X=32,Ke=64,le=128,ze=256,P=512,J=1024,Ce=2048,Z=4096,Ne=8192,Bt=16384,Se=32768,er=65536,tr=1<<18,Ut=1<<19,he=Symbol("$state"),nr=Symbol("");function Yt(e){return e===this.v}function Vt(e,t){return e!=e?t==t:e!==t||e!==null&&typeof e=="object"||typeof e=="function"}function gt(e){return!Vt(e,this.v)}function rr(e){throw new Error("effect_in_teardown")}function ir(){throw new Error("effect_in_unowned_derived")}function ar(e){throw new Error("effect_orphan")}function sr(){throw new Error("effect_update_depth_exceeded")}function or(){throw new Error("hydration_failed")}function lr(e){throw new Error("props_invalid_value")}function ur(){throw new Error("state_descriptors_fixed")}function fr(){throw new Error("state_prototype_fixed")}function cr(){throw new Error("state_unsafe_local_read")}function dr(){throw new Error("state_unsafe_mutation")}function D(e){return{f:0,v:e,reactions:null,equals:Yt,version:0}}function $t(e){return Kt(D(e))}function Ge(e){var n;const t=D(e);return t.equals=gt,S!==null&&S.l!==null&&((n=S.l).s??(n.s=[])).push(t),t}function Wt(e){return Kt(Ge(e))}function Kt(e){return C!==null&&C.f&K&&(V===null?wr([e]):V.push(e)),e}function O(e,t){return C!==null&&Et()&&C.f&K&&(V===null||!V.includes(e))&&dr(),e.equals(t)||(e.v=t,e.version=un(),zt(e,J),Et()&&k!==null&&k.f&P&&!(k.f&X)&&(R!==null&&R.includes(e)?(W(k,J),it(k)):Q===null?br([e]):Q.push(e))),t}function zt(e,t){var n=e.reactions;if(n!==null)for(var r=Et(),a=n.length,i=0;i<a;i++){var s=n[i],l=s.f;l&J||!r&&s===k||(W(s,t),l&(P|le)&&(l&K?zt(s,Ce):it(s)))}}function Gt(e){k===null&&C===null&&ar(),C!==null&&C.f&le&&ir(),kt&&rr()}function vr(e,t){var n=t.last;n===null?t.last=t.first=e:(n.next=e,e.prev=n,t.last=e)}function _e(e,t,n,r=!0){var a=(e&Ke)!==0,i=k,s={ctx:S,deps:null,nodes_start:null,nodes_end:null,f:e|J,first:null,fn:t,last:null,next:null,parent:a?null:i,prev:null,teardown:null,transitions:null,version:0};if(n){var l=ge;try{sn(!0),rt(s),s.f|=Bt}catch(f){throw ue(s),f}finally{sn(l)}}else t!==null&&it(s);var u=n&&s.deps===null&&s.first===null&&s.nodes_start===null&&s.teardown===null&&(s.f&Ut)===0;if(!u&&!a&&r&&(i!==null&&vr(s,i),C!==null&&C.f&K)){var o=C;(o.children??(o.children=[])).push(s)}return s}function hr(e){const t=_e(ve,null,!1);return W(t,P),t.teardown=e,t}function Xe(e){Gt();var t=k!==null&&(k.f&ve)!==0&&S!==null&&!S.m;if(t){var n=S;(n.e??(n.e=[])).push({fn:e,effect:k,reaction:C})}else{var r=Oe(e);return r}}function _r(e){return Gt(),qe(e)}function Xt(e){const t=_e(Ke,e,!0);return()=>{ue(t)}}function Oe(e){return _e(jt,e,!1)}function qe(e){return _e(ve,e,!0)}function Re(e){return qe(e)}function yt(e,t=0){return _e(ve|pt|t,e,!0)}function pe(e,t=!0){return _e(ve|X,e,!0,t)}function Jt(e){var t=e.teardown;if(t!==null){const n=kt,r=C;on(!0),tt(null);try{t.call(null)}finally{on(n),tt(r)}}}function ue(e,t=!0){var n=!1;if((t||e.f&tr)&&e.nodes_start!==null){for(var r=e.nodes_start,a=e.nodes_end;r!==null;){var i=r===a?null:ne(r);r.remove(),r=i}n=!0}cn(e,t&&!n),De(e,0),W(e,Ne);var s=e.transitions;if(s!==null)for(const u of s)u.stop();Jt(e);var l=e.parent;l!==null&&l.first!==null&&Zt(e),e.next=e.prev=e.teardown=e.ctx=e.deps=e.parent=e.fn=e.nodes_start=e.nodes_end=null}function Zt(e){var t=e.parent,n=e.prev,r=e.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),t!==null&&(t.first===e&&(t.first=r),t.last===e&&(t.last=n))}function Je(e,t){var n=[];mt(e,n,!0),Qt(n,()=>{ue(e),t&&t()})}function Qt(e,t){var n=e.length;if(n>0){var r=()=>--n||t();for(var a of e)a.out(r)}else t()}function mt(e,t,n){if(!(e.f&Z)){if(e.f^=Z,e.transitions!==null)for(const s of e.transitions)(s.is_global||n)&&t.push(s);for(var r=e.first;r!==null;){var a=r.next,i=(r.f&Se)!==0||(r.f&X)!==0;mt(r,t,i?n:!1),r=a}}}function Pe(e){en(e,!0)}function en(e,t){if(e.f&Z){e.f^=Z,Le(e)&&rt(e);for(var n=e.first;n!==null;){var r=n.next,a=(n.f&Se)!==0||(n.f&X)!==0;en(n,a?t:!1),n=r}if(e.transitions!==null)for(const i of e.transitions)(i.is_global||t)&&i.in()}}let Ze=!1,wt=[];function tn(){Ze=!1;const e=wt.slice();wt=[],_t(e)}function Qe(e){Ze||(Ze=!0,queueMicrotask(tn)),wt.push(e)}function pr(){Ze&&tn()}function bt(e){let t=K|J;k===null?t|=le:k.f|=Ut;const n={children:null,deps:null,equals:Yt,f:t,fn:e,reactions:null,v:null,version:0,parent:k};if(C!==null&&C.f&K){var r=C;(r.children??(r.children=[])).push(n)}return n}function gr(e){const t=bt(e);return t.equals=gt,t}function nn(e){var t=e.children;if(t!==null){e.children=null;for(var n=0;n<t.length;n+=1){var r=t[n];r.f&K?$r(r):ue(r)}}}function rn(e){var t,n=k;nt(e.parent);try{nn(e),t=fn(e)}finally{nt(n)}var r=(ye||e.f&le)&&e.deps!==null?Ce:P;W(e,r),e.equals(t)||(e.v=t,e.version=un())}function $r(e){nn(e),De(e,0),W(e,Ne),e.children=e.deps=e.reactions=e.fn=null}function yr(e){throw new Error("lifecycle_outside_component")}const an=0,mr=1;let et=an,Ie=!1,ge=!1,kt=!1;function sn(e){ge=e}function on(e){kt=e}let fe=[],$e=0,$i=[],C=null;function tt(e){C=e}let k=null;function nt(e){k=e}let V=null;function wr(e){V=e}let R=null,M=0,Q=null;function br(e){Q=e}let ln=0,ye=!1,S=null;function un(){return++ln}function Et(){return S!==null&&S.l===null}function Le(e){var s,l;var t=e.f;if(t&J)return!0;if(t&Ce){var n=e.deps,r=(t&le)!==0;if(n!==null){var a;if(t&ze){for(a=0;a<n.length;a++)((s=n[a]).reactions??(s.reactions=[])).push(e);e.f^=ze}for(a=0;a<n.length;a++){var i=n[a];if(Le(i)&&rn(i),r&&k!==null&&!ye&&!((l=i==null?void 0:i.reactions)!=null&&l.includes(e))&&(i.reactions??(i.reactions=[])).push(e),i.version>e.version)return!0}}r||W(e,P)}return!1}function kr(e,t,n){throw e}function fn(e){var f;var t=R,n=M,r=Q,a=C,i=ye,s=V;R=null,M=0,Q=null,C=e.f&(X|Ke)?null:e,ye=!ge&&(e.f&le)!==0,V=null;try{var l=(0,e.fn)(),u=e.deps;if(R!==null){var o;if(De(e,M),u!==null&&M>0)for(u.length=M+R.length,o=0;o<R.length;o++)u[M+o]=R[o];else e.deps=u=R;if(!ye)for(o=M;o<u.length;o++)((f=u[o]).reactions??(f.reactions=[])).push(e)}else u!==null&&M<u.length&&(De(e,M),u.length=M);return l}finally{R=t,M=n,Q=r,C=a,ye=i,V=s}}function Er(e,t){let n=t.reactions;if(n!==null){var r=n.indexOf(e);if(r!==-1){var a=n.length-1;a===0?n=t.reactions=null:(n[r]=n[a],n.pop())}}n===null&&t.f&K&&(R===null||!R.includes(t))&&(W(t,Ce),t.f&(le|ze)||(t.f^=ze),De(t,0))}function De(e,t){var n=e.deps;if(n!==null)for(var r=t;r<n.length;r++)Er(e,n[r])}function cn(e,t=!1){var n=e.first;for(e.first=e.last=null;n!==null;){var r=n.next;ue(n,t),n=r}}function rt(e){var t=e.f;if(!(t&Ne)){W(e,P);var n=k,r=S;k=e,S=e.ctx;try{t&pt||cn(e),Jt(e);var a=fn(e);e.teardown=typeof a=="function"?a:null,e.version=ln}catch(i){kr(i)}finally{k=n,S=r}}}function dn(){$e>1e3&&($e=0,sr()),$e++}function vn(e){var t=e.length;if(t!==0){dn();var n=ge;ge=!0;try{for(var r=0;r<t;r++){var a=e[r];a.f&P||(a.f^=P);var i=[];hn(a,i),xr(i)}}finally{ge=n}}}function xr(e){var t=e.length;if(t!==0)for(var n=0;n<t;n++){var r=e[n];!(r.f&(Ne|Z))&&Le(r)&&(rt(r),r.deps===null&&r.first===null&&r.nodes_start===null&&(r.teardown===null?Zt(r):r.fn=null))}}function Tr(){if(Ie=!1,$e>1001)return;const e=fe;fe=[],vn(e),Ie||($e=0)}function it(e){et===an&&(Ie||(Ie=!0,queueMicrotask(Tr)));for(var t=e;t.parent!==null;){t=t.parent;var n=t.f;if(n&(Ke|X)){if(!(n&P))return;t.f^=P}}fe.push(t)}function hn(e,t){var n=e.first,r=[];e:for(;n!==null;){var a=n.f,i=(a&X)!==0,s=i&&(a&P)!==0;if(!s&&!(a&Z))if(a&ve){i?n.f^=P:Le(n)&&rt(n);var l=n.first;if(l!==null){n=l;continue}}else a&jt&&r.push(n);var u=n.next;if(u===null){let c=n.parent;for(;c!==null;){if(e===c)break e;var o=c.next;if(o!==null){n=o;continue e}c=c.parent}}n=u}for(var f=0;f<r.length;f++)l=r[f],t.push(l),hn(l,t)}function ee(e){var t=et,n=fe;try{dn();const a=[];et=mr,fe=a,Ie=!1,vn(n);var r=e==null?void 0:e();return pr(),(fe.length>0||a.length>0)&&ee(),$e=0,r}finally{et=t,fe=n}}function g(e){var t=e.f;if(t&Ne)return e.v;if(C!==null){V!==null&&V.includes(e)&&cr();var n=C.deps;R===null&&n!==null&&n[M]===e?M++:R===null?R=[e]:R.push(e),Q!==null&&k!==null&&k.f&P&&!(k.f&X)&&Q.includes(e)&&(W(k,J),it(k))}if(t&K){var r=e;Le(r)&&rn(r)}return e.v}function me(e){const t=C;try{return C=null,e()}finally{C=t}}const Ar=~(J|Ce|P);function W(e,t){e.f=e.f&Ar|t}function xt(e,t=!1,n){S={p:S,c:null,e:null,m:!1,s:e,x:null,l:null},t||(S.l={s:null,u:null,r1:[],r2:D(!1)})}function Tt(e){const t=S;if(t!==null){e!==void 0&&(t.x=e);const s=t.e;if(s!==null){var n=k,r=C;t.e=null;try{for(var a=0;a<s.length;a++){var i=s[a];nt(i.effect),tt(i.reaction),Oe(i.fn)}}finally{nt(n),tt(r)}}S=t.p,t.m=!0}return e||{}}function _n(e){if(!(typeof e!="object"||!e||e instanceof EventTarget)){if(he in e)At(e);else if(!Array.isArray(e))for(let t in e){const n=e[t];typeof n=="object"&&n&&he in n&&At(n)}}}function At(e,t=new Set){if(typeof e=="object"&&e!==null&&!(e instanceof EventTarget)&&!t.has(e)){t.add(e),e instanceof Date&&e.getTime();for(let r in e)try{At(e[r],t)}catch{}const n=Ve(e);if(n!==Object.prototype&&n!==Array.prototype&&n!==Map.prototype&&n!==Set.prototype&&n!==Date.prototype){const r=Ht(n);for(let a in r){const i=r[a].get;if(i)try{i.call(e)}catch{}}}}}function z(e,t=null,n){if(typeof e!="object"||e===null||he in e)return e;const r=Ve(e);if(r!==Xn&&r!==Jn)return e;var a=new Map,i=vt(e),s=D(0);i&&a.set("length",D(e.length));var l;return new Proxy(e,{defineProperty(u,o,f){(!("value"in f)||f.configurable===!1||f.enumerable===!1||f.writable===!1)&&ur();var c=a.get(o);return c===void 0?(c=D(f.value),a.set(o,c)):O(c,z(f.value,l)),!0},deleteProperty(u,o){var f=a.get(o);return f===void 0?o in u&&a.set(o,D(L)):(O(f,L),pn(s)),!0},get(u,o,f){var h;if(o===he)return e;var c=a.get(o),d=o in u;if(c===void 0&&(!d||(h=oe(u,o))!=null&&h.writable)&&(c=D(z(d?u[o]:L,l)),a.set(o,c)),c!==void 0){var v=g(c);return v===L?void 0:v}return Reflect.get(u,o,f)},getOwnPropertyDescriptor(u,o){var f=Reflect.getOwnPropertyDescriptor(u,o);if(f&&"value"in f){var c=a.get(o);c&&(f.value=g(c))}else if(f===void 0){var d=a.get(o),v=d==null?void 0:d.v;if(d!==void 0&&v!==L)return{enumerable:!0,configurable:!0,value:v,writable:!0}}return f},has(u,o){var v;if(o===he)return!0;var f=a.get(o),c=f!==void 0&&f.v!==L||Reflect.has(u,o);if(f!==void 0||k!==null&&(!c||(v=oe(u,o))!=null&&v.writable)){f===void 0&&(f=D(c?z(u[o],l):L),a.set(o,f));var d=g(f);if(d===L)return!1}return c},set(u,o,f,c){var y;var d=a.get(o),v=o in u;if(i&&o==="length")for(var h=f;h<d.v;h+=1){var p=a.get(h+"");p!==void 0?O(p,L):h in u&&(p=D(L),a.set(h+"",p))}d===void 0?(!v||(y=oe(u,o))!=null&&y.writable)&&(d=D(void 0),O(d,z(f,l)),a.set(o,d)):(v=d.v!==L,O(d,z(f,l)));var _=Reflect.getOwnPropertyDescriptor(u,o);if(_!=null&&_.set&&_.set.call(c,f),!v){if(i&&typeof o=="string"){var $=a.get("length"),m=Number(o);Number.isInteger(m)&&m>=$.v&&O($,m+1)}pn(s)}return!0},ownKeys(u){g(s);var o=Reflect.ownKeys(u).filter(d=>{var v=a.get(d);return v===void 0||v.v!==L});for(var[f,c]of a)c.v!==L&&!(f in u)&&o.push(f);return o},setPrototypeOf(){fr()}})}function pn(e,t=1){O(e,e.v+t)}var gn,$n,yn;function Ct(){if(gn===void 0){gn=window;var e=Element.prototype,t=Node.prototype;$n=oe(t,"firstChild").get,yn=oe(t,"nextSibling").get,e.__click=void 0,e.__className="",e.__attributes=null,e.__e=void 0,Text.prototype.__t=void 0}}function Me(e=""){return document.createTextNode(e)}function te(e){return $n.call(e)}function ne(e){return yn.call(e)}function ce(e){if(!E)return te(e);var t=te(A);return t===null&&(t=A.appendChild(Me())),H(t),t}function Cr(e,t){if(!E){var n=te(e);return n instanceof Comment&&n.data===""?ne(n):n}return A}function at(e,t=1,n=!1){let r=E?A:e;for(;t--;)r=ne(r);if(!E)return r;var a=r.nodeType;if(n&&a!==3){var i=Me();return r==null||r.before(i),H(i),i}return H(r),r}function mn(e){e.textContent=""}let E=!1;function U(e){E=e}let A;function H(e){if(e===null)throw dt(),Ae;return A=e}function we(){return H(ne(A))}function re(e){if(E){if(ne(A)!==null)throw dt(),Ae;A=e}}function Nt(){for(var e=0,t=A;;){if(t.nodeType===8){var n=t.data;if(n===ct){if(e===0)return t;e-=1}else(n===Mt||n===ft)&&(e+=1)}var r=ne(t);t.remove(),t=r}}const Nr=new Set,wn=new Set;function Sr(e,t,n,r){function a(i){if(r.capture||Fe.call(t,i),!i.cancelBubble)return n.call(this,i)}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?Qe(()=>{t.addEventListener(e,a,r)}):t.addEventListener(e,a,r),a}function St(e,t,n,r,a){var i={capture:r,passive:a},s=Sr(e,t,n,i);(t===document.body||t===window||t===document)&&hr(()=>{t.removeEventListener(e,s,i)})}function Fe(e){var _;var t=this,n=t.ownerDocument,r=e.type,a=((_=e.composedPath)==null?void 0:_.call(e))||[],i=a[0]||e.target,s=0,l=e.__root;if(l){var u=a.indexOf(l);if(u!==-1&&(t===document||t===window)){e.__root=t;return}var o=a.indexOf(t);if(o===-1)return;u<=o&&(s=u)}if(i=a[s]||e.target,i!==t){Ye(e,"currentTarget",{configurable:!0,get(){return i||n}});try{for(var f,c=[];i!==null;){var d=i.assignedSlot||i.parentNode||i.host||null;try{var v=i["__"+r];if(v!==void 0&&!i.disabled)if(vt(v)){var[h,...p]=v;h.apply(i,[e,...p])}else v.call(i,e)}catch($){f?c.push($):f=$}if(e.cancelBubble||d===t||d===null)break;i=d}if(f){for(let $ of c)queueMicrotask(()=>{throw $});throw f}}finally{e.__root=t,delete e.currentTarget}}}function Or(e){var t=document.createElement("template");return t.innerHTML=e,t.content}function He(e,t){var n=k;n.nodes_start===null&&(n.nodes_start=e,n.nodes_end=t)}function be(e,t){var n=(t&Kn)!==0,r=(t&zn)!==0,a,i=!e.startsWith("<!>");return()=>{if(E)return He(A,null),A;a===void 0&&(a=Or(i?e:"<!>"+e),n||(a=te(a)));var s=r?document.importNode(a,!0):a.cloneNode(!0);if(n){var l=te(s),u=s.lastChild;He(l,u)}else He(s,s);return s}}function de(e,t){if(E){k.nodes_end=A,we();return}e!==null&&e.before(t)}const qr=["touchstart","touchmove"];function Rr(e){return qr.includes(e)}let st=!0;function bn(e){st=e}function Pr(e,t){t!==(e.__t??(e.__t=e.nodeValue))&&(e.__t=t,e.nodeValue=t==null?"":t+"")}function kn(e,t){return En(e,t)}function Ir(e,t){Ct(),t.intro=t.intro??!1;const n=t.target,r=E,a=A;try{for(var i=te(n);i&&(i.nodeType!==8||i.data!==Mt);)i=ne(i);if(!i)throw Ae;U(!0),H(i),we();const s=En(e,{...t,anchor:i});if(A===null||A.nodeType!==8||A.data!==ct)throw dt(),Ae;return U(!1),s}catch(s){if(s===Ae)return t.recover===!1&&or(),Ct(),mn(n),U(!1),kn(e,t);throw s}finally{U(r),H(a)}}const ke=new Map;function En(e,{target:t,anchor:n,props:r={},events:a,context:i,intro:s=!0}){Ct();var l=new Set,u=c=>{for(var d=0;d<c.length;d++){var v=c[d];if(!l.has(v)){l.add(v);var h=Rr(v);t.addEventListener(v,Fe,{passive:h});var p=ke.get(v);p===void 0?(document.addEventListener(v,Fe,{passive:h}),ke.set(v,1)):ke.set(v,p+1)}}};u(ht(Nr)),wn.add(u);var o=void 0,f=Xt(()=>{var c=n??t.appendChild(Me());return pe(()=>{if(i){xt({});var d=S;d.c=i}a&&(r.$$events=a),E&&He(c,null),st=s,o=e(c,r)||{},st=!0,E&&(k.nodes_end=A),i&&Tt()}),()=>{var h;for(var d of l){t.removeEventListener(d,Fe);var v=ke.get(d);--v===0?(document.removeEventListener(d,Fe),ke.delete(d)):ke.set(d,v)}wn.delete(u),Ot.delete(o),c!==n&&((h=c.parentNode)==null||h.removeChild(c))}});return Ot.set(o,f),o}let Ot=new WeakMap;function Lr(e){const t=Ot.get(e);t&&t()}function qt(e,t,n,r=null,a=!1){E&&we();var i=e,s=null,l=null,u=null,o=a?Se:0;yt(()=>{if(u===(u=!!t()))return;let f=!1;if(E){const c=i.data===ft;u===c&&(i=Nt(),H(i),U(!1),f=!0)}u?(s?Pe(s):s=pe(()=>n(i)),l&&Je(l,()=>{l=null})):(l?Pe(l):r&&(l=pe(()=>r(i))),s&&Je(s,()=>{s=null})),f&&U(!0)},o),E&&(i=A)}let Ee=null;function xn(e){Ee=e}function Dr(e,t,n,r){for(var a=[],i=t.length,s=0;s<i;s++)mt(t[s].e,a,!0);var l=i>0&&a.length===0&&n!==null;if(l){var u=n.parentNode;mn(u),u.append(n),r.clear(),ie(e,t[0].prev,t[i-1].next)}Qt(a,()=>{for(var o=0;o<i;o++){var f=t[o];l||(r.delete(f.k),ie(e,f.prev,f.next)),ue(f.e,!l)}})}function Mr(e,t,n,r,a,i=null){var s=e,l={flags:t,items:new Map,first:null};{var u=e;s=E?H(te(u)):u.appendChild(Me())}E&&we();var o=null;yt(()=>{var f=n(),c=vt(f)?f:f==null?[]:ht(f),d=c.length;let v=!1;if(E){var h=s.data===ft;h!==(d===0)&&(s=Nt(),H(s),U(!1),v=!0)}if(E){for(var p=null,_,$=0;$<d;$++){if(A.nodeType===8&&A.data===ct){s=A,v=!0,U(!1);break}var m=c[$],y=r(m,$);_=Tn(A,l,p,null,m,y,$,a,t),l.items.set(y,_),p=_}d>0&&H(Nt())}E||Fr(c,l,s,a,t,r),i!==null&&(d===0?o?Pe(o):o=pe(()=>i(s)):o!==null&&Je(o,()=>{o=null})),v&&U(!0)}),E&&(s=A)}function Fr(e,t,n,r,a,i){var s=e.length,l=t.items,u=t.first,o=u,f,c=null,d=[],v=[],h,p,_,$;for($=0;$<s;$+=1){if(h=e[$],p=i(h,$),_=l.get(p),_===void 0){var m=o?o.e.nodes_start:n;c=Tn(m,t,c,c===null?t.first:c.next,h,p,$,r,a),l.set(p,c),d=[],v=[],o=c.next;continue}if(Hr(_,h,$),_.e.f&Z&&Pe(_.e),_!==o){if(f!==void 0&&f.has(_)){if(d.length<v.length){var y=v[0],w;c=y.prev;var b=d[0],N=d[d.length-1];for(w=0;w<d.length;w+=1)An(d[w],y,n);for(w=0;w<v.length;w+=1)f.delete(v[w]);ie(t,b.prev,N.next),ie(t,c,b),ie(t,N,y),o=y,c=N,$-=1,d=[],v=[]}else f.delete(_),An(_,o,n),ie(t,_.prev,_.next),ie(t,_,c===null?t.first:c.next),ie(t,c,_),c=_;continue}for(d=[],v=[];o!==null&&o.k!==p;)o.e.f&Z||(f??(f=new Set)).add(o),v.push(o),o=o.next;if(o===null)continue;_=o}d.push(_),c=_,o=_.next}if(o!==null||f!==void 0){for(var F=f===void 0?[]:ht(f);o!==null;)F.push(o),o=o.next;var B=F.length;if(B>0){var _i=s===0?n:null;Dr(t,F,_i,l)}}k.first=t.first&&t.first.e,k.last=c&&c.e}function Hr(e,t,n,r){O(e.v,t),e.i=n}function Tn(e,t,n,r,a,i,s,l,u){var o=Ee;try{var f=(u&T)!==0,c=(u&Be)===0,d=f?c?Ge(a):D(a):a,v=u&q?D(s):s,h={i:v,v:d,k:i,a:null,e:null,prev:n,next:r};return Ee=h,h.e=pe(()=>l(e,d,v),E),h.e.prev=n&&n.e,h.e.next=r&&r.e,n===null?t.first=h:(n.next=h,n.e.next=h.e),r!==null&&(r.prev=h,r.e.prev=h.e),h}finally{Ee=o}}function An(e,t,n){for(var r=e.next?e.next.e.nodes_start:n,a=t?t.e.nodes_start:n,i=e.e.nodes_start;i!==r;){var s=ne(i);a.before(i),i=s}}function ie(e,t,n){t===null?e.first=n:(t.next=n,t.e.next=n&&n.e),n!==null&&(n.prev=t,n.e.prev=t&&t.e)}function jr(e,t,n,r,a,i){let s=E;E&&we();var l,u,o=null;E&&A.nodeType===1&&(o=A,we());var f=E?A:e,c,d=Ee;yt(()=>{const v=t()||null;var h=v==="svg"?Gn:null;if(v!==l){var p=Ee;xn(d),c&&(v===null?Je(c,()=>{c=null,u=null}):v===u?Pe(c):(ue(c),bn(!1))),v&&v!==u&&(c=pe(()=>{if(o=E?o:h?document.createElementNS(h,v):document.createElement(v),He(o,o),r){var _=E?te(o):o.appendChild(Me());E&&(_===null?U(!1):H(_)),r(o,_)}k.nodes_end=o,f.before(o)})),l=v,l&&(u=l),bn(!0),xn(p)}},Se),s&&(U(!0),H(f))}function Cn(e,t){Qe(()=>{var n=e.getRootNode(),r=n.host?n:n.head??n.ownerDocument.head;if(!r.querySelector("#"+t.hash)){const a=document.createElement("style");a.id=t.hash,a.textContent=t.code,r.appendChild(a)}})}function Br(e,t,n){Oe(()=>{var r=me(()=>t(e,n==null?void 0:n())||{});if(n&&(r!=null&&r.update)){var a=!1,i={};qe(()=>{var s=n();_n(s),a&&Vt(i,s)&&(i=s,r.update(s))}),a=!0}if(r!=null&&r.destroy)return()=>r.destroy()})}function xe(e,t,n,r){var a=e.__attributes??(e.__attributes={});E&&(a[t]=e.getAttribute(t),t==="src"||t==="srcset"||t==="href"&&e.nodeName==="LINK")||a[t]!==(a[t]=n)&&(t==="loading"&&(e[nr]=n),n==null?e.removeAttribute(t):typeof n!="string"&&Sn(e).includes(t)?e[t]=n:e.setAttribute(t,n))}function ae(e,t,n){Sn(e).includes(t)?e[t]=n:xe(e,t,n)}var Nn=new Map;function Sn(e){var t=Nn.get(e.nodeName);if(t)return t;Nn.set(e.nodeName,t=[]);for(var n,r=Ve(e);r.constructor.name!=="Element";){n=Ht(r);for(var a in n)n[a].set&&t.push(a);r=Ve(r)}return t}function je(e,t){var n=e.__className,r=Ur(t);E&&e.className===r?e.__className=r:(n!==r||E&&e.className!==r)&&(t==null?e.removeAttribute("class"):e.className=r,e.__className=r)}function Ur(e){return e??""}const Yr=requestAnimationFrame,Vr=()=>performance.now(),se={tick:e=>Yr(e),now:()=>Vr(),tasks:new Set};function On(e){se.tasks.forEach(t=>{t.c(e)||(se.tasks.delete(t),t.f())}),se.tasks.size!==0&&se.tick(On)}function Wr(e){let t;return se.tasks.size===0&&se.tick(On),{promise:new Promise(n=>{se.tasks.add(t={c:e,f:n})}),abort(){se.tasks.delete(t)}}}function ot(e,t){e.dispatchEvent(new CustomEvent(t))}function Kr(e){const t=e.split("-");return t.length===1?t[0]:t[0]+t.slice(1).map(n=>n[0].toUpperCase()+n.slice(1)).join("")}function qn(e){const t={},n=e.split(";");for(const r of n){const[a,i]=r.split(":");if(!a||i===void 0)break;const s=Kr(a.trim());t[s]=i.trim()}return t}const zr=e=>e;function Gr(e,t,n,r){var a=(e&Wn)!==0,i="both",s,l=t.inert,u,o;function f(){return s??(s=n()(t,{},{direction:i}))}var c={is_global:a,in(){t.inert=l,ot(t,"introstart"),u=Rt(t,f(),o,1,()=>{ot(t,"introend"),u==null||u.abort(),u=s=void 0})},out(p){t.inert=!0,ot(t,"outrostart"),o=Rt(t,f(),u,0,()=>{ot(t,"outroend"),p==null||p()})},stop:()=>{u==null||u.abort(),o==null||o.abort()}},d=k;if((d.transitions??(d.transitions=[])).push(c),st){var v=a;if(!v){for(var h=d.parent;h&&h.f&Se;)for(;(h=h.parent)&&!(h.f&pt););v=!h||(h.f&Bt)!==0}v&&Oe(()=>{me(()=>c.in())})}}function Rt(e,t,n,r,a){var i=r===1;if(Zn(t)){var s,l=!1;return Qe(()=>{if(!l){var _=t({direction:i?"in":"out"});s=Rt(e,_,n,r,a)}}),{abort:()=>{l=!0,s==null||s.abort()},deactivate:()=>s.deactivate(),reset:()=>s.reset(),t:()=>s.t()}}if(n==null||n.deactivate(),!(t!=null&&t.duration))return a(),{abort:We,deactivate:We,reset:We,t:()=>r};const{delay:u=0,css:o,tick:f,easing:c=zr}=t;var d=[];if(i&&n===void 0&&(f&&f(0,1),o)){var v=qn(o(0,1));d.push(v,v)}var h=()=>1-r,p=e.animate(d,{duration:u});return p.onfinish=()=>{var _=(n==null?void 0:n.t())??1-r;n==null||n.abort();var $=r-_,m=t.duration*Math.abs($),y=[];if(m>0){if(o)for(var w=Math.ceil(m/16.666666666666668),b=0;b<=w;b+=1){var N=_+$*c(b/w),F=o(N,1-N);y.push(qn(F))}h=()=>{var B=p.currentTime;return _+$*c(B/m)},f&&Wr(()=>{if(p.playState!=="running")return!1;var B=h();return f(B,1-B),!0})}p=e.animate(y,{duration:m,fill:"forwards"}),p.onfinish=()=>{h=()=>r,f==null||f(r,1-r),a()}},{abort:()=>{p&&(p.cancel(),p.effect=null)},deactivate:()=>{a=We},reset:()=>{r===0&&(f==null||f(1,0))},t:()=>h()}}function Rn(e,t){return e===t||(e==null?void 0:e[he])===t}function Pt(e={},t,n,r){return Oe(()=>{var a,i;return qe(()=>{a=i,i=[],me(()=>{e!==n(...i)&&(t(e,...i),a&&Rn(n(...a),e)&&t(null,...a))})}),()=>{Qe(()=>{i&&Rn(n(...i),e)&&t(null,...i)})}}),e}function Xr(){const e=S,t=e.l.u;t&&(t.b.length&&_r(()=>{Pn(e),_t(t.b)}),Xe(()=>{const n=me(()=>t.m.map(Qn));return()=>{for(const r of n)typeof r=="function"&&r()}}),t.a.length&&Xe(()=>{Pn(e),_t(t.a)}))}function Pn(e){if(e.l.s)for(const t of e.l.s)g(t);_n(e.s)}function Te(e,t,n,r){var w;var a=(n&jn)!==0,i=(n&Bn)!==0,s=(n&Yn)!==0,l=(n&Vn)!==0,u=e[t],o=(w=oe(e,t))==null?void 0:w.set,f=r,c=!0,d=!1,v=()=>(d=!0,c&&(c=!1,l?f=me(r):f=r),f);u===void 0&&r!==void 0&&(o&&i&&lr(),u=v(),o&&o(u));var h;if(i)h=()=>{var b=e[t];return b===void 0?v():(c=!0,d=!1,b)};else{var p=(a?bt:gr)(()=>e[t]);p.f|=er,h=()=>{var b=g(p);return b!==void 0&&(f=void 0),b===void 0?f:b}}if(!(n&Un))return h;if(o){var _=e.$$legacy;return function(b,N){return arguments.length>0?((!i||!N||_)&&o(N?h():b),b):h()}}var $=!1,m=Ge(u),y=bt(()=>{var b=h(),N=g(m);return $?($=!1,N):m.v=b});return a||(y.equals=gt),function(b,N){var F=g(y);if(arguments.length>0){const B=N?g(y):i&&s?z(b):b;return y.equals(B)||($=!0,O(m,B),d&&f!==void 0&&(f=B),g(y)),b}return F}}function Jr(e){return new Zr(e)}class Zr{constructor(t){Lt(this,G);Lt(this,j);var i;var n=new Map,r=(s,l)=>{var u=Ge(l);return n.set(s,u),u};const a=new Proxy({...t.props||{},$$events:{}},{get(s,l){return g(n.get(l)??r(l,Reflect.get(s,l)))},has(s,l){return g(n.get(l)??r(l,Reflect.get(s,l))),Reflect.has(s,l)},set(s,l,u){return O(n.get(l)??r(l,u),u),Reflect.set(s,l,u)}});Dt(this,j,(t.hydrate?Ir:kn)(t.component,{target:t.target,props:a,context:t.context,intro:t.intro??!1,recover:t.recover})),(!((i=t==null?void 0:t.props)!=null&&i.$$host)||t.sync===!1)&&ee(),Dt(this,G,a.$$events);for(const s of Object.keys(I(this,j)))s==="$set"||s==="$destroy"||s==="$on"||Ye(this,s,{get(){return I(this,j)[s]},set(l){I(this,j)[s]=l},enumerable:!0});I(this,j).$set=s=>{Object.assign(a,s)},I(this,j).$destroy=()=>{Lr(I(this,j))}}$set(t){I(this,j).$set(t)}$on(t,n){I(this,G)[t]=I(this,G)[t]||[];const r=(...a)=>n.call(this,...a);return I(this,G)[t].push(r),()=>{I(this,G)[t]=I(this,G)[t].filter(a=>a!==r)}}$destroy(){I(this,j).$destroy()}}G=new WeakMap,j=new WeakMap;let In;typeof HTMLElement=="function"&&(In=class extends HTMLElement{constructor(t,n,r){super();Y(this,"$$ctor");Y(this,"$$s");Y(this,"$$c");Y(this,"$$cn",!1);Y(this,"$$d",{});Y(this,"$$r",!1);Y(this,"$$p_d",{});Y(this,"$$l",{});Y(this,"$$l_u",new Map);Y(this,"$$me");this.$$ctor=t,this.$$s=n,r&&this.attachShadow({mode:"open"})}addEventListener(t,n,r){if(this.$$l[t]=this.$$l[t]||[],this.$$l[t].push(n),this.$$c){const a=this.$$c.$on(t,n);this.$$l_u.set(n,a)}super.addEventListener(t,n,r)}removeEventListener(t,n,r){if(super.removeEventListener(t,n,r),this.$$c){const a=this.$$l_u.get(n);a&&(a(),this.$$l_u.delete(n))}}async connectedCallback(){if(this.$$cn=!0,!this.$$c){let t=function(a){return i=>{const s=document.createElement("slot");a!=="default"&&(s.name=a),de(i,s)}};if(await Promise.resolve(),!this.$$cn||this.$$c)return;const n={},r=Qr(this);for(const a of this.$$s)a in r&&(a==="default"&&!this.$$d.children?(this.$$d.children=t(a),n.default=!0):n[a]=t(a));for(const a of this.attributes){const i=this.$$g_p(a.name);i in this.$$d||(this.$$d[i]=lt(i,a.value,this.$$p_d,"toProp"))}for(const a in this.$$p_d)!(a in this.$$d)&&this[a]!==void 0&&(this.$$d[a]=this[a],delete this[a]);this.$$c=Jr({component:this.$$ctor,target:this.shadowRoot||this,props:{...this.$$d,$$slots:n,$$host:this}}),this.$$me=Xt(()=>{qe(()=>{var a;this.$$r=!0;for(const i of Ue(this.$$c)){if(!((a=this.$$p_d[i])!=null&&a.reflect))continue;this.$$d[i]=this.$$c[i];const s=lt(i,this.$$d[i],this.$$p_d,"toAttribute");s==null?this.removeAttribute(this.$$p_d[i].attribute||i):this.setAttribute(this.$$p_d[i].attribute||i,s)}this.$$r=!1})});for(const a in this.$$l)for(const i of this.$$l[a]){const s=this.$$c.$on(a,i);this.$$l_u.set(i,s)}this.$$l={}}}attributeChangedCallback(t,n,r){var a;this.$$r||(t=this.$$g_p(t),this.$$d[t]=lt(t,r,this.$$p_d,"toProp"),(a=this.$$c)==null||a.$set({[t]:this.$$d[t]}))}disconnectedCallback(){this.$$cn=!1,Promise.resolve().then(()=>{!this.$$cn&&this.$$c&&(this.$$c.$destroy(),this.$$me(),this.$$c=void 0)})}$$g_p(t){return Ue(this.$$p_d).find(n=>this.$$p_d[n].attribute===t||!this.$$p_d[n].attribute&&n.toLowerCase()===t)||t}});function lt(e,t,n,r){var i;const a=(i=n[e])==null?void 0:i.type;if(t=a==="Boolean"&&typeof t!="boolean"?t!=null:t,!r||!n[e])return t;if(r==="toAttribute")switch(a){case"Object":case"Array":return t==null?null:JSON.stringify(t);case"Boolean":return t?"":null;case"Number":return t??null;default:return t}else switch(a){case"Object":case"Array":return t&&JSON.parse(t);case"Boolean":return t;case"Number":return t!=null?+t:t;default:return t}}function Qr(e){const t={};return e.childNodes.forEach(n=>{t[n.slot||"default"]=!0}),t}function Ln(e,t,n,r,a,i){let s=class extends In{constructor(){super(e,n,a),this.$$p_d=t}static get observedAttributes(){return Ue(t).map(l=>(t[l].attribute||l).toLowerCase())}};return Ue(t).forEach(l=>{Ye(s.prototype,l,{get(){return this.$$c&&l in this.$$c?this.$$c[l]:this.$$d[l]},set(u){var c;u=lt(l,u,t),this.$$d[l]=u;var o=this.$$c;if(o){var f=(c=oe(o,l))==null?void 0:c.get;f?o[l]=u:o.$set({[l]:u})}}})}),r.forEach(l=>{Ye(s.prototype,l,{get(){var u;return(u=this.$$c)==null?void 0:u[l]}})}),i&&(s=i(s)),e.element=s,s}let ut=$t(void 0);const ei=async()=>(O(ut,z(await window.loadCardHelpers().then(e=>e))),g(ut)),ti=()=>g(ut)?g(ut):ei();function Dn(e){S===null&&yr(),S.l!==null?ni(S).m.push(e):Xe(()=>{const t=me(e);if(typeof t=="function")return t})}function ni(e){var t=e.l;return t.u??(t.u={a:[],b:[],m:[]})}function ri(e){const t=e-1;return t*t*t+1}function ii(e,{delay:t=0,duration:n=400,easing:r=ri,axis:a="y"}={}){const i=getComputedStyle(e),s=+i.opacity,l=a==="y"?"height":"width",u=parseFloat(i[l]),o=a==="y"?["top","bottom"]:["left","right"],f=o.map($=>`${$[0].toUpperCase()}${$.slice(1)}`),c=parseFloat(i[`padding${f[0]}`]),d=parseFloat(i[`padding${f[1]}`]),v=parseFloat(i[`margin${f[0]}`]),h=parseFloat(i[`margin${f[1]}`]),p=parseFloat(i[`border${f[0]}Width`]),_=parseFloat(i[`border${f[1]}Width`]);return{delay:t,duration:n,easing:r,css:$=>`overflow: hidden;opacity: ${Math.min($*20,1)*s};${l}: ${$*u}px;padding-${o[0]}: ${$*c}px;padding-${o[1]}: ${$*d}px;margin-${o[0]}: ${$*v}px;margin-${o[1]}: ${$*h}px;border-${o[0]}-width: ${$*p}px;border-${o[1]}-width: ${$*_}px;`}}var ai=be('<span class="loading svelte-1sdlsm">Loading...</span>'),si=be('<div class="outer-container"><!></div> <!>',1);const oi={hash:"svelte-1sdlsm",code:`
  .loading.svelte-1sdlsm {
    padding: 1em;
    display: block;
  }
`};function It(e,t){xt(t,!0),Cn(e,oi);const n=Te(t,"type",7,"div"),r=Te(t,"config",7),a=Te(t,"hass",7),i=Te(t,"marginTop",7,"0px");let s=$t(void 0),l=$t(!0);Xe(()=>{g(s)&&(g(s).hass=a())}),Dn(async()=>{if(!g(s)){console.error("container not found");return}const v=(await ti()).createCardElement(r());v.hass=a(),g(s).replaceWith(v),O(s,z(v)),O(l,!1)});var u=si(),o=Cr(u),f=ce(o);jr(f,n,!1,(d,v)=>{Pt(d,h=>O(s,z(h)),()=>g(s)),je(d,"svelte-1sdlsm"),Gr(3,d,()=>ii)}),re(o);var c=at(o,2);return qt(c,()=>g(l),d=>{var v=ai();de(d,v)}),Re(()=>xe(o,"style",`margin-top: ${i()??""};`)),de(e,u),Tt({get type(){return n()},set type(d="div"){n(d),ee()},get config(){return r()},set config(d){r(d),ee()},get hass(){return a()},set hass(d){a(d),ee()},get marginTop(){return i()},set marginTop(d="0px"){i(d),ee()}})}customElements.define("expander-sub-card",Ln(It,{type:{},config:{},hass:{},marginTop:{}},[],[],!0));function li(e,t){t=Object.assign({open:!0,duration:.2,easing:"ease"},t);const r=()=>{};let a=r,i=r;const s=()=>{a(),a=r,i=r};e.addEventListener("transitionend",s);async function l(){return new Promise((h,p)=>{a=h,i=p})}async function u(){return new Promise(requestAnimationFrame)}function o(){return`height ${t.duration}s ${t.easing}`}e.style.transition=o(),e.style.height=t.open?"auto":"0px",t.open?e.style.overflow="visible":e.style.overflow="hidden";async function f(){e.style.height=e.scrollHeight+"px";try{await l(),e.style.height="auto",e.style.overflow="visible"}catch{}}async function c(){e.style.height==="auto"?(e.style.transition="none",await u(),e.style.height=e.scrollHeight+"px",e.style.transition=o(),await u(),e.style.overflow="hidden",e.style.height="0px"):(i(),e.style.overflow="hidden",e.style.height="0px")}function d(h){t=Object.assign(t,h),t.open?f():c()}function v(){e.removeEventListener("transitionend",s)}return{update:d,destroy:v}}const ui={gap:"0.0em","expanded-gap":"0.6em",padding:"1em",clear:!1,title:" ","overlay-margin":"0.0em","child-padding":"0.0em","child-margin-top":"0.0em","button-background":"transparent","expander-card-background":"var(--ha-card-background,var(--card-background-color,#fff))","header-color":"var(--primary-text-color,#fff)","arrow-color":"var(--arrow-color,var(--primary-text-color,#fff))","expander-card-display":"block","title-card-clickable":!1,"min-width-expanded":0,"max-width-expanded":0};var fi=be('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>',2),ci=be("<button><div> </div> <ha-icon></ha-icon></button>",2),di=be('<div class="children-container svelte-icqkke"></div>'),vi=be("<ha-card><!> <!></ha-card>",2);const hi={hash:"svelte-icqkke",code:`
    .expander-card.svelte-icqkke {
        display: var(--expander-card-display,block);
        gap: var(--gap);
        padding: var(--padding);
        background: var(--card-background,#fff);
    }
    .children-container.svelte-icqkke {
        padding: var(--child-padding);
        display: var(--expander-card-display,block);
        gap: var(--gap);
    }
    .clear.svelte-icqkke {
        background: none !important;
        background-color: transparent !important;
        border-style: none !important;
    }
    .title-card-header.svelte-icqkke {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
    }
    .title-card-header-overlay.svelte-icqkke {
        display: block;
    }
    .title-card-container.svelte-icqkke {
        width: 100%;
        padding: var(--title-padding);
    }
    .header.svelte-icqkke {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.8em 0.8em;
        margin: 2px;
        background: var(--button-background);
        border-style: none;
        width: var(--header-width,auto);
        color: var(--header-color,#fff);
    }
    .header-overlay.svelte-icqkke {
        position: absolute;
        top: 0;
        right: 0;
        margin: var(--overlay-margin);
    }
    .title.svelte-icqkke {
        width: 100%;
        text-align: left;
    }
    .ico.svelte-icqkke {
        color: var(--arrow-color,var(--primary-text-color,#fff));
        transition-property: transform;
        transition-duration: 0.35s;
    }

    .flipped.svelte-icqkke {
        transform: rotate(180deg);
    }

    .ripple.svelte-icqkke {
        background-position: center;
        transition: background 0.8s;
        border-radius: 1em;
    }
    .ripple.svelte-icqkke:hover {
        background: #ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;
    }
    .ripple.svelte-icqkke:active {
        background-color: #ffffff25;
        background-size: 100%;
        transition: background 0s;
    }
`};function Mn(e,t){xt(t,!1),Cn(e,hi);let n=Wt(!1),r=!1,a=Te(t,"hass",12,void 0),i=Te(t,"config",12),s=Wt(),l=!1;Dn(()=>{const m=i()["min-width-expanded"],y=i()["max-width-expanded"],w=document.body.offsetWidth;if(m&&y?i(i().expanded=w>=m&&w<=y,!0):m?i(i().expanded=w>=m,!0):y&&i(i().expanded=w<=y,!0),i().expanded!==void 0&&O(n,i().expanded),!r){if(i()["title-card-clickable"]){g(s).parentElement&&(r=!0,g(s).parentElement.addEventListener("click",b=>{if(l)return b.preventDefault(),b.stopImmediatePropagation(),l=!1,!1;O(n,!g(n))}));return}g(s).tagName==="BUTTON"&&(r=!0,g(s).addEventListener("click",b=>{if(l)return b.preventDefault(),b.stopImmediatePropagation(),l=!1,!1;O(n,!g(n))}))}});let u,o=!1,f=0,c=0;const d=m=>{u=m.target,f=m.touches[0].clientX,c=m.touches[0].clientY,o=!1},v=m=>{const y=m.touches[0].clientX,w=m.touches[0].clientY;(Math.abs(y-f)>10||Math.abs(w-c)>10)&&(o=!0)},h=m=>{!o&&u===m.target&&i()["title-card-clickable"]&&O(n,!g(n)),u=void 0,l=!0,setTimeout(()=>l=!1,300)};Xr();var p=vi(),_=ce(p);qt(_,()=>i()["title-card"],m=>{var y=fi(),w=ce(y),b=ce(w);It(b,{get hass(){return a()},get config(){return i()["title-card"]},get type(){return i()["title-card"].type}}),re(w);var N=at(w,2);Pt(N,B=>O(s,B),()=>g(s));var F=ce(N);ae(F,"icon","mdi:chevron-down"),re(N),re(y),Re(()=>{je(y,`${`title-card-header${i()["title-card-button-overlay"]?"-overlay":""}`??""} svelte-icqkke`),xe(w,"style",`--title-padding:${i()["title-card-padding"]??""}`),xe(N,"style",`--overlay-margin:${i()["overlay-margin"]??""}; --button-background:${i()["button-background"]??""}; --header-color:${i()["header-color"]??""};`),je(N,`${`header ripple${i()["title-card-button-overlay"]?" header-overlay":""}${g(n)?" open":" close"}`??""} svelte-icqkke`),ae(F,"style",`--arrow-color:${i()["arrow-color"]??""}`),ae(F,"class",`${`ico${g(n)?" flipped open":"close"}`??""} svelte-icqkke`)}),St("touchstart",w,d,void 0,!0),St("touchmove",w,v,void 0,!0),St("touchend",w,h),de(m,y)},m=>{var y=ci();Pt(y,F=>O(s,F),()=>g(s));var w=ce(y),b=ce(w);re(w);var N=at(w,2);ae(N,"icon","mdi:chevron-down"),re(y),Re(()=>{je(y,`${`header${i()["expander-card-background-expanded"]?"":" ripple"}${g(n)?" open":" close"}`??""} svelte-icqkke`),xe(y,"style",`--header-width:100%; --button-background:${i()["button-background"]??""};--header-color:${i()["header-color"]??""};`),je(w,`${`primary title${g(n)?" open":" close"}`??""} svelte-icqkke`),Pr(b,i().title),ae(N,"style",`--arrow-color:${i()["arrow-color"]??""}`),ae(N,"class",`${`ico${g(n)?" flipped open":" close"}`??""} svelte-icqkke`)}),de(m,y)});var $=at(_,2);return qt($,()=>i().cards&&g(n),m=>{var y=di();Mr(y,5,()=>i().cards,w=>w,(w,b)=>{It(w,{get hass(){return a()},get config(){return g(b)},get type(){return g(b).type},get marginTop(){return i()["child-margin-top"]}})}),re(y),Re(()=>xe(y,"style",`--expander-card-display:${i()["expander-card-display"]??""};
             --gap:${(g(n)?i()["expanded-gap"]:i().gap)??""}; --child-padding:${i()["child-padding"]??""}`)),Br(y,(w,b)=>li(w,b),()=>({open:g(n),duration:.3,easing:"ease"})),de(m,y)}),re(p),Re(()=>{ae(p,"class",`${`expander-card${i().clear?" clear":""}${g(n)?" open":" close"}`??""} svelte-icqkke`),ae(p,"style",`--expander-card-display:${i()["expander-card-display"]??""};
     --gap:${(g(n)?i()["expanded-gap"]:i().gap)??""}; --padding:${i().padding??""};
     --expander-state:${g(n)??""};
     --card-background:${(g(n)&&i()["expander-card-background-expanded"]?i()["expander-card-background-expanded"]:i()["expander-card-background"])??""}`)}),de(e,p),Tt({get hass(){return a()},set hass(m){a(m),ee()},get config(){return i()},set config(m){i(m),ee()}})}return customElements.define("expander-card",Ln(Mn,{hass:{},config:{}},[],[],!0,e=>class extends e{setConfig(t={}){this.config={...ui,...t}}})),console.info(`%c  Expander-Card 
%c Version 2.2.0`,"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray"),window.customCards=window.customCards||[],window.customCards.push({type:"expander-card",name:"Expander Card",preview:!0,description:"Expander card"}),Mn});
//# sourceMappingURL=expander-card.umd.cjs.map