const _ = require('lodash');

/**
 * Module interface.
 */

const templates = (type, text) => {
  switch (type) {
    case 'paragraph': return `<p>${text}</p>`;
    case 'heading': return `<h2 class="intertitre">${text}</h2>`;
    case 'question': return `<p class="question">${text}</p>`;
    case 'reference': return `<p class="reference"><span>${text}</span></p>`;
    case 'catchphrase': return `<div class="encart_retrait_gauche"><span class="accroche">${text}</span></div>`;
    case 'bulletedList': return `<ul>${text}</ul>`;
    case 'numberedList': return `<ol>${text}</ol>`;
    case 'quote': return `<blockquote class="citation">${text}</blockquote>`;
    case 'trueFact': return `<h2 class="tag"><span class="vrai">${text}</span></h2>`;
    case 'falseFact': return `<h2 class="tag"><span class="faux">${text}</span></h2>`;
    case 'blurryFact': return `<h2 class="tag"><span class="flou">${text}</span></h2>`;
    case 'forgottenFact': return `<h2 class="tag"><span class="oubli">${text}</span></h2>`;
    case 'ratherFact': return `<h2 class="tag"><span class="plutot_vrai">${text}</span></h2>`;
    default: return `<p>${text}</p>`;
  };
};

/**
 * Format a single text node.
 */

module.exports = (node) => {
  if (_.isEmpty(node.content.text)) return callback(null, '');

  return templates(node.content.type, node.content.text);
}
