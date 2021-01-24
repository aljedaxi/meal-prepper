const {
  pipe,
  map,
  joinWith,
} = require('sanctuary');

const toCheckbox = s => `
	<div class="ingredient">
		<label for="${s}">${s}</label>
		<input id="${s}" type="checkbox">
	</div>
`;

const template = s => `
	<form action="_ => alert('done')">
		${s}
	</form>
`;

const asHtmlChecklist = pipe([
  map (toCheckbox),
  joinWith ('\n'),
  template,
]);

module.exports = {asHtmlChecklist};
