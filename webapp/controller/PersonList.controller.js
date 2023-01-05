sap.ui.define(
	[
		"./BaseController",
		"sap/ui/Device",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
	],
	function (
		BaseController,
		Device,
		Controller,
		Filter,
		FilterOperator,
		JSONModel,
		MessageToast,
		MessageBox
	) {
		"use strict";

		return BaseController.extend("sap.ui.demo.todo.controller.PersonList", {
			onInit: function () {
				var oViewModel = new JSONModel({});
				this.setModel(oViewModel, "personListView");
				this.getRouter()
					.getRoute("personList")
					.attachMatched(this._onRouteMatched, this);
				var oTable = this.getView().byId("personTable");
				this._getPersonList();
			},

			onSearch: function (oEvent) {
				this._getPersonList(oEvent.getSource().getValue());
			},

			onAddPerson: function (oEvent) {
				this.getRouter().navTo("personEdit", {
					objectId: "new",
				});
			},

			onNavBack: function () {
				this.getRouter().navTo("home", {}, true);
			},

			onEditPerson: function (oEvent) {
				var oTable = this.getView().byId("personTable");
				var selectedItems = oTable.getSelectedItems();
				var that = this;
				if (selectedItems.length === 0) {
					MessageToast.show(
						this.getResourceBundle().getText("msgSelectARecord")
					);
				} else if (selectedItems.length > 1) {
					MessageToast.show(
						this.getResourceBundle().getText(
							"msgSelectOnlyOneRecord"
						)
					);
				} else {
					var selectedItem = selectedItems[0];
					var context = selectedItem.getBindingContext();
					var obj = context.getProperty(null, context);
					this.getRouter().navTo(
						"personEdit",
						{
							objectId: obj._id,
						},
						true
					);
				}
			},

			onDeletePerson: function (oEvent) {
				var oTable = this.getView().byId("personTable");
				var selectedItems = oTable.getSelectedItems();
				var iSuccess = 0;
				var that = this;
				if (selectedItems.length > 0) {
					MessageBox.confirm(
						this.getResourceBundle().getText(
							"msgQuestionDeletePerson"
						),
						{
							onClose: function (oAction) {
								if (oAction === sap.m.MessageBox.Action.OK) {
									for (
										var i = 0;
										i < selectedItems.length;
										i++
									) {
										var item = selectedItems[i];
										var context = item.getBindingContext();
										var obj = context.getProperty(
											null,
											context
										);
										var token = that.getUserToken();
										var notAuthorized = false;
										$.ajax({
											type: "DELETE",
											headers: { Authorization: token },
											url: "/person" + "?_id=" + obj._id,
											async: false,
											success: function (data, status) {
												iSuccess++;
											},
											error: function (error) {
												if (error.status === 401) {
													notAuthorized = true;
													that.getRouter().navTo(
														"login"
													);
												}
											},
										});
									}
									if (iSuccess == selectedItems.length) {
										MessageToast.show(
											that
												.getResourceBundle()
												.getText("msgRecordDeleted")
										);
									} else {
										if (notAuthorized) {
											that.getRouter().navTo("login");
										} else {
											MessageToast.show(
												that
													.getResourceBundle()
													.getText(
														"msgRecordDeleteError"
													)
											);
										}
									}
									that._getPersonList();
								}
							},
						}
					);
				} else {
					MessageToast.show(
						this.getResourceBundle().getText(
							"msgSelectAtLeastARecord"
						)
					);
				}
			},

			_getPersonList: function (sSearchQuery) {
				var url = "/person";
				if (sSearchQuery) {
					url =
						url +
						"?" +
						"cpf: { $regex: " +
						"'" +
						sSearchQuery +
						"'" +
						" }";
				}
				var that = this;
				var token = this.getUserToken();
				$.ajax({
					type: "GET",
					headers: { Authorization: token },
					url: url,
					async: false,
					success: function (data, status) {
						var attModel = new sap.ui.model.json.JSONModel();
						attModel.setData({
							Person: data,
						});
						that.getView().setModel(attModel);
					},
					error: function (error) {
						if (error.responseJSON.msg) {
							MessageToast.show(error.responseJSON.msg, {
								duration: 6000,
							});
						}
						if (error.status === 401) {
							that.getRouter().navTo("login");
						}
					},
				});
			},

			_onRouteMatched: function (oEvent) {
				this._getPersonList();
			},
		});
	}
);
