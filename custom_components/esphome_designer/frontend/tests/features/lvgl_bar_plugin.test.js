import { describe, expect, it } from 'vitest';

import plugin from '../../features/lvgl_bar/plugin.js';

describe('lvgl bar plugin', () => {
    it('renders optional top and bottom labels around the bar track', () => {
        const host = document.createElement('div');

        plugin.render(host, {
            id: 'power_bar',
            type: 'lvgl_bar',
            width: 120,
            height: 40,
            props: {
                min: 0,
                max: 100,
                value: 75,
                color: 'green',
                bg_color: 'gray',
                top_text: 'Solar',
                bottom_text: '75%',
                label_font_size: 10,
                label_color: 'black'
            }
        }, {
            getColorStyle: (value) => `css-${value}`
        });

        expect(host.children).toHaveLength(3);
        expect(host.children[0].textContent).toBe('Solar');
        expect(host.children[1].firstElementChild?.style.width).toBe('75%');
        expect(host.children[2].textContent).toBe('75%');
    });

    it('exports plain bars unchanged when labels are empty', () => {
        const exported = plugin.exportLVGL({
            id: 'plain_bar',
            type: 'lvgl_bar',
            width: 100,
            height: 20,
            props: {
                min: 0,
                max: 100,
                value: 25,
                color: 'blue',
                bg_color: 'gray'
            }
        }, {
            common: { id: 'plain_bar', x: 1, y: 2, width: 100, height: 20 },
            convertColor: (value) => `Color(${value})`,
            getLVGLFont: (family, size, weight) => `${family}_${size}_${weight}`
        });

        expect(exported.bar).toMatchObject({
            id: 'plain_bar',
            value: 25,
            min_value: 0,
            max_value: 100
        });
    });

    it('wraps labeled bars in an object with label children', () => {
        const exported = plugin.exportLVGL({
            id: 'labeled_bar',
            type: 'lvgl_bar',
            width: 100,
            height: 44,
            props: {
                min: 0,
                max: 100,
                value: 40,
                color: 'blue',
                bg_color: 'gray',
                top_text: 'Grid',
                bottom_text: '40%',
                label_font_size: 12,
                label_color: 'white'
            }
        }, {
            common: { id: 'labeled_bar', x: 1, y: 2, width: 100, height: 44 },
            convertColor: (value) => `Color(${value})`,
            getLVGLFont: (family, size, weight) => `${family}_${size}_${weight}`
        });

        expect(exported.obj.id).toBe('labeled_bar_bar_group');
        expect(exported.obj.widgets).toHaveLength(3);
        expect(exported.obj.widgets[0].label.text).toBe('"Grid"');
        expect(exported.obj.widgets[1].bar.id).toBe('labeled_bar');
        expect(exported.obj.widgets[1].bar.height).toBe(12);
        expect(exported.obj.widgets[2].label.text).toBe('"40%"');
    });
});
