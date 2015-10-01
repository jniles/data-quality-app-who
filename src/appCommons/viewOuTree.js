(function() {

	var app = angular.module('dataQualityApp');

	app.directive('ouTree', function () {
		return {
			scope: {
				'onSelect': '&'
			},
			bindToController: true,
			controller: "ouTreeController",
			controllerAs: 'ouCtrl',
			templateUrl: 'appCommons/viewOuTree.html'
		};
	});


	app.controller("ouTreeController",
		['d2Meta', 'd2Utils',
			function(d2Meta, d2Utils) {
				var self = this;

				function ouTreeInit() {

					self.ouTreeData = [];
					self.ouTreeControl = {};

					//Get initial batch of orgunits and populate
					d2Meta.userAnalysisOrgunits().then(function(data) {

						//Iterate in case of multiple roots
						for (var i = 0; i < data.length; i++) {
							var ou = data[i];
							var root = {
								label: ou.name,
								data: {
									ou: ou
								},
								children: []
							}

							d2Utils.arraySortByProperty(ou.children, 'name', false);

							for (var j = 0; ou.children && j < ou.children.length; j++) {

								var child = ou.children[j];

								root.children.push({
									label: child.name,
									data: {
										ou: child
									},
									noLeaf: child.children
								});
							}


							self.ouTreeData.push(root);
							self.ouTreeControl.select_first_branch();
							self.ouTreeControl.expand_branch(self.ouTreeControl.get_selected_branch());

						}
					});

				}

				self.ouTreeSelect = function (orgunit) {
					if (orgunit.noLeaf && orgunit.children.length < 1) {

						//Get children
						d2Meta.object('organisationUnits', orgunit.data.ou.id, 'children[name,id,level,children::isNotEmpty]').then(
							function (data) {
								var children = data.children;
								d2Utils.arraySortByProperty(children, 'name', false);
								for (var i = 0; i < children.length; i++) {
									var child = children[i];
									if (!orgunit.children) orgunit.children = [];
									orgunit.children.push({
										label: child.name,
										data: {
											ou: child
										},
										noLeaf: child.children
									});

								}
							}
						);
					}

					self.onSelect({orgunit: orgunit.data.ou});
				}

				ouTreeInit();

				return self;
			}]);

})();