//-----------------------------------------------------------------------------
// Game Engine - supports the main requirements of the game - such as
// creating the window to display graphics etc.  Also provides 
// overide functions to help with common tasks
//
// Functions:
// game_start   -- will start the main loop running (run override)
// game_stop    -- stop the main loop running.
//
//
// Extend:      -- Add these functions is required.
//          
// keyup        -- create a key up function to process key up events
// keydown      -- create a key down function to process key down events
// run          -- main loop called frequently by the system
//                      place game logic and graphic drawing here 
//
//-----------------------------------------------------------------------------
class game_engine extends game_surface{
    constructor() {
        super();

        this.data = {
            debug: 0,                       // debug               
            timing_now: 0,                  // timimg
            timing_then: 0,                 // timimg
            timing_elapsed: 0,              // timimg
            fpsRequest: 0,                  // fps that we want
            fpsActual: 0,                   // actual fps achived
            fpsInterval: 0,                 // fps interval (ms)
            game_logic_now: 0,              // timimg fo rgame logic
            game_logic_then: 0,
            game_logic_elapsed: 0,
            run_main_loop: false,
            extra_data: false,            
        };

        //this.run_data = false;
    }

   
    //-----------------------------------------------------------------------------
    // Main Loop.  This will simply loop around and around until
    // you tell it to stop.
    // it will call your "run" function if you have supplied one
    // allowing you work on your code rather than worry about figring out looping
    // etc.
    //-----------------------------------------------------------------------------
    main_loop() {

        var self = this;

        this.data.timing_now = Date.now();
        this.data.timing_elapsed = this.data.timing_now - this.data.timing_then;

        if (this.data.run_main_loop == true) {

            // Request our new animation frame.  This is usually the same
            // refresh rate as the monitor
            requestAnimationFrame(function() {self.main_loop()});

            if (this.data.timing_elapsed > this.data.fpsInterval) {

                //console.log(this.timing_elapsed);
                //console.log(1/(this.timing_elapsed/1000));  //log fps 
                this.data.fpsActual = ((1/this.data.timing_elapsed)*1000);
                if (this.run && typeof(this.run) == 'function') {
                    this.data.game_logic_then = Date.now();
                    this.run(this.data.extra_data);        
                    this.data.game_logic_now = Date.now();
                    this.data.game_logic_elapsed = this.data.game_logic_now - this.data.game_logic_then;        
                }
                // Only update 60 fps
                this.data.timing_then = this.data.timing_now - (this.data.timing_elapsed % this.data.fpsInterval);
            }
        }
    }


    

    //-----------------------------------------------------------------------------
    // Start the main game loop
    //-----------------------------------------------------------------------------
    game_start(data, fps) {

        this.data.run_main_loop = true;

        if (data != undefined)
            this.data.extra_data = data;

        if (fps == undefined)            
            fps = 40;

        this.data.fpsRequest        = fps;                
        this.data.timing_now        = Date.now();
        this.data.timing_then       = Date.now();
        this.data.timing_elapsed    = 0;        
        this.data.fpsInterval       = 1000/fps; 
        this.data.run_main_loop     = true;

        this.main_loop();
    }

    
    //-----------------------------------------------------------------------------
    // Stop the main game loop
    //-----------------------------------------------------------------------------
    game_stop() {
        this.data.run_main_loop = false;
        console.log("End Loop");
    }


    //-----------------------------------------------------------------------------
    // Create our canvas window - give it a width, height
    // and a basic background color
    //-----------------------------------------------------------------------------
    window_create(width, height, color) {

        // Create canvas and give it attributes
        this.surface.canvas = document.createElement("canvas");
        this.surface.canvas.setAttribute("id", "main_canvas");

        this.surface.canvas.width = width;
        this.surface.canvas.height = height;
        
        // Create the canvas to draw on.
        this.surface.context = this.surface.canvas.getContext("2d");


        // create div container
        var container = document.createElement("div");
        container.setAttribute("id", "main_canvas_container");
        container.appendChild(this.surface.canvas);

        document.body.insertBefore(container, document.body.childNodes[0]);
        //document.body.appendChild(this.surface.canvas, document.body.childNodes[0]);
        //document.body.insertBefore(this.surface.canvas, document.body.childNodes[0]);


        // Create keyboard event handling.
        var self = this;        
        document.addEventListener("keydown", function(event){   
            event.preventDefault();     
            self.window_keydown(self, event);
        },false);

        document.addEventListener("keyup", function(event){
            event.preventDefault();
            self.window_keyup(self, event);
        },false);
        
        //document.addEventListener("keydown", this.window_keydown, false);
        //document.addEventListener("keyup", this.window_keyup, false);
        if (color != null && color != undefined) {
            if (color==0) 
                color = '#000';

            if (color.charAt(0)!='#')
                color = '#' + color;                

            this.set_background_color(color);
        }        
    }

    
    //-----------------------------------------------------------------------------
    // close the previously created window
    //-----------------------------------------------------------------------------
    window_close() {

        //document.removeEventListener("keydown");
        //document.removeEventListener("keyup");

        document.body.removeChild("main_canvas_container");
        //document.body.removeChild(main_canvas);
        this.surface.context = false;
        this.surface.canvas = false;
    }

    
    //-----------------------------------------------------------------------------
    // Standard key processing for the game
    //-----------------------------------------------------------------------------
    window_keydown(self, event) {

        // Do in game key processing first - give the override function
        // time to process the escape key 

        // code here.
        if (self.keydown && typeof(self.keydown) == "function") {
            if (self.data.extra_data != false) 
                self.keydown(self.data.extra_data, event);
            else                
                self.keydown(self, event);            
        }

        //console.log(event);
        //console.log(event.key);
        //var key = String.fromCharCode(event.keyCode);

        // Esc Key kill game?        
        if (event.key == "Escape") {
            self.game_stop();
            self.window_close();
        }
    }


    //-----------------------------------------------------------------------------
    // Standard key processing for the game
    //-----------------------------------------------------------------------------
    window_keyup(self, event) {
        if (self.keyup && typeof(self.keyup) == "function") {
            if (self.data.extra_data != false)
                self.keyup(self.data.extra_data, event)
            else
                self.keyup(self, event);
        }
    }


    //-----------------------------------------------------------------------------
    // Sleep function - sleep for X amount of time. (not built in yet?)
    //-----------------------------------------------------------------------------
    
    sleeping(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /*
    async sleep(ms) {
        console.log('start sleep func');
        await this.sleeping(ms);
        console.log('stop sleep func');
    }
    */
    
    /*
    sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    */

    fade_out_loop(delay_seconds, set_fade_level) {

        if (delay_seconds == undefined)     {   delay_seconds = 3;   }
        if (set_fade_level != undefined) {
            this.surface.context.globalAlpha = 0;
            return true;
        }
        
        // Frames per second with requestAnimationFrame is (normally) based on the monitor refresh rate
        // guess 65 fps as a ball park figure
        
        var frames_per_sec = 65;
        var speed = 0;
        if (delay_seconds > 0)        
            speed = 1 / (frames_per_sec * delay_seconds);

        var alpha_val = this.surface.context.globalAlpha;

        if (alpha_val == 0)
            return true;

        if (alpha_val > 0 )
        {
            alpha_val = alpha_val - speed;
            if (alpha_val < 0 )
                alpha_val = 0;
        }             
        this.surface.context.globalAlpha = alpha_val;        
        return false;
    }

    fade_out(game_obj, delay_seconds) {

        var self = this;

        if (delay_seconds == undefined)     {   delay_seconds = 3;   }

        // Frames per second with requestAnimationFrame is (normally) based on the monitor refresh rate
        // guess 65 fps as a ball park figure
        var frames_per_sec = 60;
        var speed = 0;
        if (delay_seconds > 0)        
            speed = 1 / (frames_per_sec * delay_seconds);
        
        return new Promise(function(resolve, reject) {
        
            function step(game_obj, delay_seconds) {
                var alpha_val = self.surface.context.globalAlpha;
                if (alpha_val > 0 )
                {
                    alpha_val = alpha_val - speed;
                    if (alpha_val < 0 )
                        alpha_val = 0;
                }
                self.surface.context.globalAlpha = alpha_val;

                //console.log('drawing');
                if (alpha_val > 0 ) {
                    self.clear();
                    self.draw_image(game_obj, 0, 0);           
                    requestAnimationFrame(function() { step(game_obj, delay_seconds) });//self.fade_out(game_obj, delay_seconds) }); 
                    //this.surface.context.drawImage(game_obj, 0, 0);
                }
                else {
                    // make sure last frame is drawn - else may still see item
                    // when fading to black
                    self.clear();
                    self.draw_image(game_obj, 0, 0);     
                    resolve();
                }
            }
            step(game_obj, delay_seconds);
        });        
    }



    fade_in_loop(delay_seconds, set_fade_level) {

        if (delay_seconds == undefined)     {   delay_seconds = 3;   }
        if (set_fade_level != undefined) {
            this.surface.context.globalAlpha = 1;
            return true;
        }

        // Frames per second with requestAnimationFrame is (normally) based on the monitor refresh rate
        // guess 65 fps as a ball park figure
        var frames_per_sec = 60;
        var speed = 0;
        if (delay_seconds > 0)        
            speed = 1 / (frames_per_sec * delay_seconds);

        var alpha_val = this.surface.context.globalAlpha;

        if (alpha_val == 1)
            return true;

        if (alpha_val < 1 )
        {
            alpha_val = alpha_val + speed;
            if (alpha_val > 1 )
                alpha_val = 1;
        }
        this.surface.context.globalAlpha = alpha_val;            
        return false;

    }

    fade_in(game_obj, delay_seconds) {

        var self = this;

        if (delay_seconds == undefined)     {   delay_seconds = 3;   }

        // Frames per second with requestAnimationFrame is (normally) based on the monitor refresh rate
        // guess 65 fps as a ball park figure
        var frames_per_sec = 65;
        var speed = 0;
        if (delay_seconds > 0)        
            speed = 1 / (frames_per_sec * delay_seconds);
        
        return new Promise(function(resolve, reject) {
        
            function step(game_obj, delay_seconds) {
                var alpha_val = self.surface.context.globalAlpha;
                if (alpha_val < 1 )
                {
                    alpha_val = alpha_val + speed;
                    if (alpha_val > 1 )
                        alpha_val = 1;
                }
                self.surface.context.globalAlpha = alpha_val;

                //console.log('drawing');
                if (alpha_val < 1 ) {
                    self.clear();
                    self.draw_image(game_obj, 0, 0);           
                    requestAnimationFrame(function() { step(game_obj, delay_seconds) });//self.fade_out(game_obj, delay_seconds) }); 
                    //this.surface.context.drawImage(game_obj, 0, 0);
                }
                else {
                    // make sure last frame is drawn - else may still see item
                    // when fading to black
                    self.clear();
                    self.draw_image(game_obj, 0, 0);     
                    resolve();
                }
            }
            step(game_obj, delay_seconds);
        });        
    }

    

    //-----------------------------------------------------------------------------
    // Draw an image
    // If a surface has an image loaded you can just call draw image
    // and pass the surface.  - this will draw the image
    //-----------------------------------------------------------------------------
    draw_image(game_obj, x, y, width, height) {

        // We need a window to draw on.
        if (!this.surface.context) {
            console.log('You have not create a game engine window for the game engine to draw on.');
            return;
        }

        if (game_obj.draw_image && typeof game_obj.draw_image == 'function') {            
            game_obj.draw_image(this.surface.context, x, y, width, height);
        }

    }



    draw_sprite(game_obj, sprite_sequence, x, y, sprite) {

        // We need a window to draw on.
        if (!this.surface.context) {
            console.log('You have not create a game engine window for the game engine to draw on.');
            return;
        }

        // Draw the object passed in if it has a draw function.
        if (game_obj.draw_sprite  && typeof game_obj.draw_sprite == 'function')
            game_obj.draw_sprite(this.surface.context, sprite_sequence, x, y, sprite);


    }


    //-----------------------------------------------------------------------------
    // Draw the game object on to this context (surface)
    //-----------------------------------------------------------------------------
    draw(game_obj) {

        // We need a window to draw on.
        if (!this.surface.context) {
            console.log('You have not create a game engine window for the game engine to draw on.');
            return;
        }

        // Draw the object passed in if it has a draw function.
        if (game_obj.draw  && typeof game_obj.draw == 'function')
            game_obj.draw(this.surface.context);


        // If debug output some info like fps
        if (this.data.debug) {            

            this.set_text_font('12pt Arial');

            this.text_write('Fps Request=(Hz)'              + this.data.fpsRequest.toFixed(2), 20, 20);
            this.text_write('Fps Actual=(Hz)'               + this.data.fpsActual.toFixed(2), 20, 40);
            this.text_write('Fps Interval Request (ms)='    + this.data.fpsInterval.toFixed(2), 20, 60);
            this.text_write('Delta Frame Rate Adjust ='     + (this.data.timing_elapsed % this.data.fpsInterval).toFixed(2), 20, 80);
            this.text_write('Timing Elapsed (ms)='          + this.data.timing_elapsed, 20,100);
            this.text_write('Game logic took=(ms)'          + this.data.game_logic_elapsed, 20, 120);
        }
        
    }

}