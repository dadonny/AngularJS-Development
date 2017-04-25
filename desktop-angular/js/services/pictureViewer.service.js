angular.module('potbot').factory('pictureViewerService', ['lodash','$timeout', function(_, $timeout) {
	// Might use a resource here that returns a JSON array
	var state = {
		shown:false,
		source:''
	};


	return {
		show:function(source){
			console.log('shown',source);
			state.source = source;
			state.shown = true;
		},

		hide:function(){
			state.source = '';
			state.shown = false;
		},
		state:state
	};
}]);
