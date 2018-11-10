
//-----------------------------------------------------------------------------
// Game surface - A wrapper around the html5 canvas element.  Other classes 
// will extend this class as the will work with the canvas element. 
// This requires the game_image class.
//
//  -- either of these two will create a surface that can be used.
//  -- loading an image will create the surface and place the image on it.
//  -- ready for drawing.
//    
//          create_surface(width, height)       
//          load_image(file_path)
//
//
//
// Overrides:
// draw(context)        -- any class that extends the surface class should
//                      -- override this function.
//-----------------------------------------------------------------------------
class game_surface {

    // standard constructor
    constructor () {            

        this.surface = {
            debug: false,
            canvas: false,
            context: false,
            text_font: '',
            text_color: ''
        };
    }


    //-----------------------------------------------------------------------------
    // The a color to clip on the sprite
    //-----------------------------------------------------------------------------
    set_clipping_color(r, g, b) {

        var transparentColor = {
            r: 0,
            g: 0,
            b: 0
        };

        if (r != undefined)
            transparentColor.r = r;

        if (g != undefined)
            transparentColor.g = g;

        if (b != undefined)
            transparentColor.b = b;

        var width = this.surface.canvas.width;
        var height = this.surface.canvas.height;

        var pixels = this.surface.context.getImageData(0, 0, width, height);

        var i = 0;
        var len = pixels.data.length;
        for (i = 0; i < len; i+=4) {

            var r = pixels.data[i];
            var g = pixels.data[i + 1];
            var b = pixels.data[i + 2];

            if (r == transparentColor.r && g == transparentColor.g && b == transparentColor.b) {
                pixels.data[i + 3] = 0;
            }
        }

        this.surface.context.putImageData(pixels, 0, 0);
               
    }


    
    //-----------------------------------------------------------------------------
    // Create a surface for drawing on.
    //-----------------------------------------------------------------------------
    create_surface (width, height) {
      
        this.surface.canvas = document.createElement("canvas");
        this.surface.canvas.setAttribute("id", "off_screen_canvas");
        
        this.surface.canvas.width = width;
        this.surface.canvas.height = height;
            
        // Create the canvas to draw on.
        this.surface.context = this.surface.canvas.getContext("2d");
    }


    //-----------------------------------------------------------------------------
    // Clear the canvas (make transparent)
    //-----------------------------------------------------------------------------
    clear() {
        this.surface.context.clearRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);
    }


    set_clipping_rect(x, y, width, height) {

        if (this.surface.context) {
            this.surface.context.rect(x, y, width, height);
            this.surface.context.clip();
        }
        else if (this.surface.debug) {
            console.log('You need to create a surface first');
        }

    }



    //-----------------------------------------------------------------------------
    // Load an image
    //-----------------------------------------------------------------------------
    load_image(file_path) {

        var self = this;
        var promise = new Promise(function(resolve, reject) {

            // Load the image
            var loading_image = new game_image();
            loading_image.load_image(file_path)
            .then(function() {
                // Draw our image on to our new surface
                self.create_surface(loading_image.get_width(), loading_image.get_height());        
                self.surface.context.drawImage(loading_image.image, 0, 0);                
                loading_image.clear_image();
                resolve('Success');
            },function(){
                reject('Cannot find image ' + file_path);
            });
        });        
        return promise;
    }


    /*
    fade(tmp_image, opacity_percent, delay_seconds) {

        var self = this;
        var promise = new Promise(function(resolve, reject) {
            self.fadei(tmp_image, opacity_percent, delay_seconds)
            .then(function(){
                resolve();
            });
        });

        return promise;
    }*/

    //-----------------------------------------------------------------------------
    // Fade out the current screen
    //-----------------------------------------------------------------------------
    /*
    fadei(tmp_image, opacity_percent, delay_seconds) {
        
        // NOTE: this does not fade what is already on the screen but sets
        // the opacity for the next time items are drawn.
        var self = this;
        
        

        if (delay_seconds == undefined)     {   delay_seconds = 3;   }
        if (opacity_percent == undefined)   {   opacity_percent = 100;    }

                
        var alpha_end       = opacity_percent / 100;        
        var alpha_current   = self.surface.context.globalAlpha;
        var alpha_change    = alpha_current - alpha_end;
        var alpha_new       = alpha_current;


        // Frames per second with requestAnimationFrame is (normally) based on the monitor refresh rate
        // guess 65 fps as a ball park figure
        var frames_per_sec = 65;
        var speed = 0;
        if (delay_seconds > 0)        
            speed = 1 / (frames_per_sec * delay_seconds);

        if (speed == 0)
        {
            // No delay - new value is the same as value set.
            alpha_new = alpha_end;
        }   
        else if (alpha_change > 0)
        {
            alpha_new = alpha_current - speed;
            if (alpha_new < alpha_end)
                alpha_new = alpha_end;
        }
        else
        {            
            alpha_new = alpha_current + speed;
            if (alpha_new > alpha_end)
                alpha_new = alpha_end;
        }
        
        
        // if main loop running - we can just return here
        if (alpha_end != alpha_current) {            
            requestAnimationFrame(function() { self.fade(tmp_image, opacity_percent, delay_seconds) });            
            self.clear();
            self.surface.context.globalAlpha = alpha_new;
            self.surface.context.drawImage(tmp_image, 0, 0);            
        }
        else if (alpha_end == alpha_current)  {
            console.log('resolve in fadei');
            resolve();
        }
        else {
            reject();
        }
            
    }
    */


    //-----------------------------------------------------------------------------
    // Set the background color of the basic canvas
    //-----------------------------------------------------------------------------
    set_background_color(color) {
        if (this.surface.context) {
            this.surface.context.fillStyle = color;        
            this.surface.context.fillRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);
        }
        else {
            console.log('set_background_color called on context that does not exist, window created?');
        }
    }

    
    //-----------------------------------------------------------------------------
    // Set the basic text_font information for drawing text
    // For example: "40pt serif"
    //-----------------------------------------------------------------------------
    set_text_font(text_font) {        
        this.surface.text_font = text_font;
    }

    //-----------------------------------------------------------------------------
    // Set the text text_color 
    // EG: Blue 
    // #000000
    //-----------------------------------------------------------------------------
    set_text_color(text_color) {
        this.surface.text_color = text_color;
        this.surface.context.strokeStyle = this.surface.text_color;
    }

    text_write(text, x, y) {

        if (this.surface.text_font.length > 0)
            this.surface.context.font = this.surface.text_font;

        var currentFillStyle = this.surface.context.fillStyle;            
        if (this.surface.text_color.length > 0 ) 
            this.surface.context.fillStyle = this.surface.text_color;

        this.surface.context.fillText(text, x, y);

        if (this.surface.text_color.length)
            this.surface.context.fillStyle = currentFillStyle;
    }

    text_stroke(text, x, y) {
        this.surface.context.text_font = "40pt serif";
        this.surface.context.strokeText(text, x, y);
    }

  
    //-----------------------------------------------------------------------------
    // Draw any image canvas on this context
    // Note this is overridden in the game engine to draw on the engines
    // context
    //-----------------------------------------------------------------------------
    draw_image(context, x=0, y=0, width, height) {

        if (width == undefined)     { width = this.surface.canvas.width; }
        if (height == undefined)    { height = this.surface.canvas.height; }

        if (context != undefined) {            
            context.drawImage(this.surface.canvas, x, y, width, height);        
        }
    }
    
    //-----------------------------------------------------------------------------
    // Override function: The sprite or map should override this function
    // so the game engine can draw them correctly.
    //-----------------------------------------------------------------------------
    draw(context) {
        console.log('The draw function in the game surface should be overridden by classes inheriting it');
        // this will draw a sprite and automatically animate it.
        //this.surface.context.drawImage(image_src, 0, 0);
    }

    draw_sprite(context, sprite_sequence, x, y, sprite) {
        // this will draw a particular sprite
        console.log('The draw_sprite function in the game surface should be overridden by classes inheriting it');
    }

}

