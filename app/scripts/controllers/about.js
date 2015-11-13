'use strict';

/**
 * @ngdoc function
 * @name imageTestApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the imageTestApp
 */
angular.module('imageTestApp')
.directive('darkroom', function($http, $q) {
    return {
            restrict: 'E',
            template: '<img />',
            scope: {
                image: '=',
                onCrop: '&',
                history: '=',
                crop: '=',
                rotate: '=',
                save: '=',
                minWidth: '=',
                minHeight: '=',
                maxWidth: '=',
                maxHeight: '=',
                rawDarkroom: '=?'
            },
            link: function(scope, element, attrs) {
                var darkroom = scope.rawDarkroom = null;
                var clearing_darkroom = false;

                function clear_darkroom() {
                    if (darkroom) {
                        darkroom.selfDestroy();
                        clearing_darkroom = true;
                    }
                }

                function load_new_image() {
                    var imgElt = element.find('img');

                    // If darkroom has previously been instantiated
                    // we need to destroy it and start fresh with the new image.
                    if (darkroom) {
                        // Clearing the plugin image takes a moment.
                        // Don't bother proceeding until it's done.
                        if (imgElt.attr('data-used')) {
                            // If we're not already clearing the darkroom, start now.
                            if (!clearing_darkroom) {
                                clear_darkroom();
                            }

                            // Chill for half a second and try again.
                            setTimeout(load_new_image, 0.5);
                            return false;
                        } else {
                            // clearing is done! Proceed.
                            clearing_darkroom = false;
                            // Patch for darkroom#selfDestroy, they didn't clear their listener.
                            imgElt[0].onload = null;
                        }
                    }

                    imgElt.attr({
                        crossOrigin: 'anonymous',
                        src: scope.image,
                        'data-used': true
                    });

                    scope.rawDarkroom = darkroom = new Darkroom(imgElt[0], {
                        // Size options
                        minWidth: scope.minWidth || 100,
                        minHeight: scope.minHeight || 100,
                        maxWidth: scope.maxWidth || 650,
                        maxHeight: scope.maxHeight || 500,
                        plugins: {
                            save: scope.save || false,
                            rotate: scope.rotate || false,
                            crop: scope.crop || false,
                            history: scope.history || false
                        },
                        initialize: function() {
                            var instance = this,
                                cropPlugin = this.plugins['crop'];

                            cropPlugin.requireFocus();

                            instance.addEventListener('core:transformation', function() {
                                scope.onCrop({
                                    image: instance.canvas.toDataURL()
                                });
                            });
                        }
                    });
                }

                scope.$watch('image', function(new_value) {
                    if (new_value)
                        load_new_image();
                });
            }
        };
  })
  .controller('AboutCtrl', function ($scope, $http) {

    $scope.image = '';
    $scope.preview_image = '';

     function load_new_image(file) {
         var oFReader = new FileReader();
         oFReader.readAsDataURL(file);

         oFReader.onload = function(ofr_event) {
             $scope.image = ofr_event.target.result;
             $scope.$apply();
         };
     }

    $scope.image_changed = function(image) {
         $scope.preview_image = image;
         $scope.$apply();
     };

    // $scope.upload_by_url = function() {
    //      console.log('called', _me.image_url);
    //      fabric.Image.fromURL(_me.image_url, function(img) {
    //          console.log(img.toString());
    //      });
    //      $scope.image = $scope.image_url;
    //  };

     var handleFileSelect=function(evt) {
       var file=evt.currentTarget.files[0];
       load_new_image(file);
     }

     $scope.uploadFile = function() {

         var blob = dataURItoBlob($scope.preview_image);

         var fd = new FormData();
         fd.append('file', blob, 'file.png');
         fd.append('entityId', '12341234');

         $scope.brokerageUpate = "uploading";
         $http.post(
           "http://0.0.0.0:8010/api/v1/photo/uploadPhotoToRdc",
           fd, {
               transformRequest: angular.identity,
               headers: { 'Content-Type': undefined }
             }
           ).success(function (response) {
             $scope.response = response;
           }).error(function (response) {
             $scope.brokerageUpate = "error";
           });

     };

     angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);

      function dataURItoBlob(dataURI) {
          var byteString;
          if (dataURI.split(',')[0].indexOf('base64') >= 0)
              byteString = atob(dataURI.split(',')[1]);
          else
              byteString = unescape(dataURI.split(',')[1]);

          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
          var ia = new Uint8Array(byteString.length);
          for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
          }

          return new Blob([ia], {type:mimeString});
      }
});
