const mongoose = require("mongoose");

const Person = mongoose.model("Person", {
	name: String,
	birth: String,
	cpf: String,
	rg: String,
	phone: String,
	zipCode: String,
	addres: String,
	user: String,
	userCheck: String,
	office: String,
	person: String,
	module: String,
	project: String,
	manager: String,
	workplace: String,
	sapID: String,
});

module.exports = Person;
