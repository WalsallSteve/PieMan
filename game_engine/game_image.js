//-----------------------------------------------------------------------------
// Game Image Support for loading images
// Used eith on its own or as a Aggregation in other classes.
//
// Functions:
// load_image(path, width, height)      -- load the image from a file.
// clear_image()                        -- relase resources
//
//-----------------------------------------------------------------------------
//
class game_image {

    constructor() {
        this.image = false;
    }
   

    //-----------------------------------------------------------------------------
    // Load Image 
    // Will load an image that the browse can normally use such as (GIF, JPG, PNG)
    // and store in an object that can be used.
    //-----------------------------------------------------------------------------
    load_image(path) {
        
        // Load image method 2 - Creates an image object "<img>" and loads
        // the image into it.  It then convert the image object in to a ImageBitmap
        // type for faster drawing.  It also has a promise so you can wait until 
        // the bitmap has loaded.
        var self = this;        
        var promise = new Promise(function(resolve, reject) {
            
            var imageObj = new Image();      
            //imageObj.setAttribute('crossOrigin', '');       
            imageObj.onload = function() {
                Promise.all(
                    [createImageBitmap(this, 0, 0, this.width, this.height)]    
                )
                .then(function(bitmap){
                    self.image = bitmap[0];
                    resolve();                    
                });         
            };

            imageObj.onerror = function() {
                console.log("Error loading image " + path);
                reject();
            }

            // Set the src of an image to start loading.
            imageObj.src = path;// + '?' + new Date().getTime();
            //imageObj.setAttribute('crossOrigin', '');
            //imageObj.crossOrigin="anonymous";         
        });        
        return promise;
    }


    //-----------------------------------------------------------------------------
    // Clear Image Release resources
    //-----------------------------------------------------------------------------
    clear_image() {
        if (this.image)
            this.image.close();
    }    


    //-----------------------------------------------------------------------------
    // get Width
    //-----------------------------------------------------------------------------
    get_width() {
        return this.image.width;
    }


    //-----------------------------------------------------------------------------
    // get height
    //-----------------------------------------------------------------------------
    get_height() {
        return this.image.height;
    }

    //-----------------------------------------------------------------------------
    // Return the image object
    //-----------------------------------------------------------------------------
    get_image() {
        return this.image;        
    }


}
