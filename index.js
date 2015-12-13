var stylus = require('stylus');
var css = require('css');
var CssSelectorParser = require('css-selector-parser').CssSelectorParser;
var _ = require('lodash');

module.exports.forEntityTech = function (tech, techsConfig, entity) {
    var str = tech.content;

    stylus(str).render(function (err, style) {
        if (err) throw err;

        var ast = css.parse(style);
        var rules = ast.stylesheet.rules;

        rules.forEach(function (rule) {
            var type = rule.type;

            if (type === 'rule') {
                var selectors = rule.selectors;

                selectors.forEach(function (selector) {
                    var parser = new CssSelectorParser();

                    parser.registerSelectorPseudos('has');
                    parser.registerNestingOperators('>', '+', '~');
                    parser.registerAttrEqualityMods('^', '$', '*', '~');
                    parser.enableSubstitutes();

                    var obj = parser.parse(selector);

                    if (obj.rule.hasOwnProperty('classNames')) {
                        var classNames = obj.rule.classNames;
                        var isMatched = _.includes(classNames, entity.getName());

                        if (!isMatched) {
                            entity.addError({
                                msg: 'Name of entity is not correct',
                                tech: tech.tech
                            });
                        }
                    }
                });
            }
        });
    });
};
