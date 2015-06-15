var myApp=angular.module('myApp',['ngRoute']);
myApp.config(['$routeProvider',function($routeProvider) {
	$routeProvider.when('/login',{
		templateUrl:'/Views/login.html',
		controller:'LoginCtrl'
	}).when('/register',{
		templateUrl:'/Views/register.html',
		controller:'RegisterCtrl'
	}).when('/menu',{
		templateUrl:'/Views/mainmenu.html',
		controller:'MenuCtrl'
	}).when('/totalstops',{
		templateUrl:'/Views/totalstops.html',
		controller:'StopsCtrl'
	}).when('/mytime',{
		templateUrl:'/Views/mytimer.html',
		controller:'TimeCtrl'
	}).when('/allrecords',{
		templateUrl:'/Views/allrecords.html',
		controller:'RecordCtrl'
	}).otherwise({
		redirectTo:'/login'
	});
}]);
myApp.factory('timeService', function() {
  return {
      dateval : '',
      todaydate:'',
      progressTime:0,
      startTime:0,
      noOfStops:0,
      isPause:false,
      timerDataObj:[]
    };
});
myApp.factory('storageService', ['timeService', function(timeService){
	var factoryobj={};
	factoryobj.storeData=function(){
		if(timeService.todaydate.length>0){
			var findIndex=-1;
			if(localStorage.getItem('timeData')!==null){
				timeService.timerDataObj=JSON.parse(localStorage.getItem('timeData'));
				$.each(timeService.timerDataObj,function(key,value){
					if(value.date==timeService.todaydate){
						findIndex=key;
						return;
					}
				});
			}
			if(findIndex>=0){
				timeService.timerDataObj[findIndex]={date:timeService.todaydate,pTime:timeService.progressTime,sTime:timeService.startTime,nStop:timeService.noOfStops}
			}else{
				timeService.timerDataObj.push({
		 			date:timeService.todaydate,
		      		pTime:timeService.progressTime,
		      		sTime:timeService.startTime,
		      		nStop:timeService.noOfStops
				});
			}
			localStorage.setItem('timeData',JSON.stringify(timeService.timerDataObj));
		 }
	};
	factoryobj.getData=function(){
		return localStorage.getItem('timeData');
	};
	return factoryobj;
}])

myApp.controller('LoginCtrl',function($scope){
	$scope.isSubmited=false;
	$scope.login=function(){
		if($scope.loginForm.$valid){
			window.location='#/menu';
		}else{
			$scope.isSubmited=true;
		}
	};

	$scope.register=function(){
		window.location='#/register';
	};
	$scope.forgot=function(){
	
	};	
});
myApp.controller('RegisterCtrl',function($scope){
	$scope.isSubmited=false;
	$scope.register=function(){
		if($scope.registerForm.$valid){
			window.location='#/menu';
		}else{
			$scope.isSubmited=true;
		}
		
	};
	$scope.cancel=function(){
		window.location='#/login';
	};
});
myApp.controller('MenuCtrl', function($scope,timeService,storageService){
	$scope.goToAllTimes=function(){
		window.location='#/mytime';
	};
	$scope.goTonoOfStops=function(){
		window.location='#/totalstops';
	};
	$scope.goToAllRecord=function(){
		window.location='#/allrecords';
	};
	$scope.leavetheDay=function(){
		storageService.storeData();
	};
	$scope.logout=function(){
		storageService.storeData();
		window.location='#/login';
	};

});
myApp.directive('back',function(){
	
	return {
		directive:'A',
		link: function($scope, iElm, iAttrs, controller) {
			iElm.on('click',function () {
				window.location='#/menu';
			});
		}
	};
});

myApp.controller('StopsCtrl',function($scope){
	
});
myApp.controller('TimeCtrl',function($scope,timeService){

	this.startTimeLoc=timeService.startTime;
	this.noOfStopsLoc=timeService.noOfStops;
	that=this;
	$scope.timerStart=function(){
		if(!timeService.isPause){
			timeService.startTime=timeService.dateval;
			that.startTimeLoc=timeService.startTime;
		}//$scope.progressTime=calcdiff($scope.startTime,$scope.dateval);
		timeService.isPause=false;
	};
	
	$scope.timerPause=function(){
		timeService.isPause=true;
		timeService.noOfStops+=1;
		that.noOfStopsLoc=timeService.noOfStops;
	};
	
	$scope.timerStop=function(){

	};
});
myApp.directive('progresstimeattr', ['$timeout','timeService', function($timeout,timeService){
	// Runs during compile
	return {
		 restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
		 link: function(scope ,iElm, iAttrs) {
			scope.$watch(iAttrs.progresstimeattr,function(value){
				updateprogesTimer();
			});
			function calcdiff(start, end) {
			 	start = start.split(":");
		    	end = end.split(":");
		    	var startDate = new Date(0, 0, 0, start[0], start[1], start[2]);
		    	var endDate = new Date(0, 0, 0, end[0], end[1], end[2]);
		    	var diffval = endDate.getTime() - startDate.getTime();
		    	var hours = Math.floor(diffval / 1000 / 60 / 60);
		    	diffval -= hours * 1000 * 60 * 60;
		    	var minutes = Math.floor(diffval / 1000 / 60);
		       	return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
			}
			function updateprogesTimer(){
				if(timeService.startTime!=0 && !timeService.isPause){
					timeService.progressTime=calcdiff(timeService.startTime,timeService.dateval);
					iElm.text(timeService.progressTime);
				}
			}
			function timerUpdater(){
				$timeout(function(){
					 updateprogesTimer();
					 timerUpdater();
					}, 1000);   
			}
			timerUpdater();
		}
	};
}]);
myApp.directive('mytimeattr',[ '$timeout','$filter','timeService', function($timeout,$filter,timeService){
	// Runs during compile
	return function(scope, iElm, iAttrs) {
			scope.$watch(iAttrs.mytimeattr,function(value){
				updateTimer();
			});
			function updateTimer(){
				 timeService.dateval=$filter('date')(new Date(),'hh:mm:ss');
				 timeService.todaydate=$filter('date')(new Date(),'yyyy:MMM:dd');
			 	 iElm.text(timeService.dateval);

			}
			function timeUpdater(){
				$timeout(function(){
					 updateTimer();
					 timeUpdater();
					}, 1000);   
			}
			timeUpdater();
		}
}]);
myApp.controller('RecordCtrl',function($scope,storageService){
	$scope.selectedMonth='Month';
	$scope.selectMonth=function(){
		$scope.selectedMonth=this.monthsaData;	
	}
	$scope.months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	$scope.allRecords=JSON.parse(storageService.getData());
	console.log($scope.allRecords)
});
