sap.ui.define([
	"./BaseController",
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, Device, Controller, Filter, FilterOperator, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.todo.controller.PersonEdit", {

		onInit: function () {
			var oViewModel = new JSONModel();
			this.setModel(oViewModel, "personEditView");
			this.getRouter().getRoute("personEdit").attachMatched(this._onRouteMatched, this);
		},

		onSave: function (oEvent) {
			var personModel = this.getView().getModel("personModel"),
				aPerson = personModel.getData(),
				that = this;
			if (!aPerson._id) {
				this._createPerson(aPerson);
			} else {
				this._updatePerson(aPerson);
			}
		},

		onCancel: function (oEvent) {
			this.getRouter().navTo("personList");
		},

		onNavBack: function () {
			this.getRouter().navTo("personList", {}, true);
		},

		_onRouteMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			var sPageTitle = "";
			if (sObjectId === "new") {
				var oNewModel = new sap.ui.model.json.JSONModel();
				oNewModel.setData({
					name: "",
					cpf: ""
				});
				this.getView().setModel(oNewModel, "personModel");
				sPageTitle = this.getResourceBundle().getText("personCreateTitle");
			} else {
				this._getPerson(sObjectId);
				sPageTitle = this.getResourceBundle().getText("personEditTitle");
			}
			this.getView().byId("pagePersonEdit").setTitle(sPageTitle);
		},

		_getPerson: function (id) {
			var that = this;
			var token = this.getUserToken();
			$.ajax({
				type: "GET",
				headers: { "Authorization": token },
				url: "/person" + "?_id=" + id,
				async: false,
				success: function (data, status) {
					if (data.length > 0) {
						var oEditModel = new sap.ui.model.json.JSONModel();
						oEditModel.setData(data[0]);
						that.getView().setModel(oEditModel, "personModel");
					}
				},
				error: function (error) {
					if (error.responseJSON.msg) {
						MessageToast.show(error.responseJSON.msg, { duration: 6000 });
					}
					if (error.status === 401) {
						that.getRouter().navTo("login");
					}
				}
			});
		},

		_createPerson: function (aPerson) {
			var that = this;
			var token = this.getUserToken();
			jQuery.ajax({
				type: "POST",
				headers: { "Authorization": token },
				url: "/person",
				dataType: "json",
				data: aPerson,
				async: false,
				success: function (response, status) {
					if (response.msg) {
						MessageToast.show(response.msg);
						that.getRouter().navTo("personList");
					}
				},
				error: function (error) {
					if (error.responseJSON.msg) {
						MessageToast.show(error.responseJSON.msg, { duration: 6000 });
					}
					if (error.status === 401) {
						that.getRouter().navTo("login");
					}
				}
			});
		},

		_updatePerson: function (aPerson) {
			var that = this;
			var token = this.getUserToken();
			jQuery.ajax({
				type: "PUT",
				headers: { "Authorization": token },
				url: "/person",
				dataType: "json",
				data: aPerson,
				async: false,
				success: function (response, status) {
					if (response.msg) {
						MessageToast.show(response.msg);
						that.getRouter().navTo("personList");
					}
				},
				error: function (error) {
					if (error.responseJSON.msg) {
						MessageToast.show(error.responseJSON.msg, { duration: 6000 });
					}
					if (error.status === 401) {
						that.getRouter().navTo("login");
					}
				}
			});
		}
	});
});
