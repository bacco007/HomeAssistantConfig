import {en} from "./languages/en.js"
import {en_US} from "./languages/en_US.js"
import {es} from "./languages/es.js"
import {es_419} from "./languages/es_419.js"
import {pt_BR} from "./languages/pt_BR.js"

var languages = {
    en: en,
    en_US: en_US,
    es: es,
    es_419: es_419,
    pt_BR: pt_BR,
};

export class Translator {
    constructor(lang = "en") {
        this.lang = lang.replace(/['"]+/g, '').replace('-', '_');
    }

    translate(key, search, replace) {
        var lang = this.lang;
        var translated;
        search = search || '';
        replace = replace || '';

        try {
            translated = key.split('.').reduce(function (o, i) { return o[i]; }, languages[lang]);
        }
        catch (e) {
            try {
                translated = key.split('.').reduce(function (o, i) { return o[i]; }, languages[lang].substring(0,2));
            }
            catch (e) {
                try {
                    translated = key.split('.').reduce(function (o, i) { return o[i]; }, languages['en']);
                }
                catch (e) {
                    translated = '{' + key + '}';
                }
            }
        }
        if ((translated === undefined) || (!(typeof translated === 'string') && !(translated instanceof String))) {
            translated = '{' + key + '}';
        }
        if (search !== '' && replace !== '') {
            translated = translated.replace(search, replace);
        }
        return translated;
    }
}