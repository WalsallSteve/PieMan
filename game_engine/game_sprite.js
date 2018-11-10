



// Game Sprite 
class game_sprite extends game_surface {
    constructor() {
        super();

        // Sprite info
        this.sprite = {
            debug: 0,            
            x_pos: 0,                       // X pos
            y_pos: 0,                       // y pos     
            width: 0,                       // width 
            height: 0,                      // height
            pixel_border: 0,                // if the sprite has a border we can remove it
            x_offset: 0,                    // x_offset (center point)
            y_offset: 0,                    // y_offset (center point)            
            status: 0,                      // sprite status - dead - alive etc
            sprite: 0,                      // current sprite in animation sequence
            animate: false,                 // Should I animate this sprite                         
            animation_sequence: 0,          // current animation sequence
            animation_sequence_data: []     // animation sequence
        };


        // Possible sprite statuses - can extend by 
        // deriving a new class
        this.statusEnum = {
            DEAD: 0,
            DYING: 1,
            REANIMATE: 3,
            ALIVE: 4,
            SCARED: 5            
        }
        

        //this.sprite=0;              // current sprite to display
        //this.num_sprites = 0;       // num sorites 
    }

    set_debug(debug) {
        this.sprite.debug = debug;
    }


    set_sprite_status_dead() {
        this.sprite.status = this.statusEnum.DEAD;
    }

    set_sprite_status_alive() {
        this.sprite.status = this.statusEnum.ALIVE;
    }

    //-----------------------------------------------------------------------------
    // Set the position of the sprite
    //-----------------------------------------------------------------------------
    set_position(x, y) {

        if (typeof(x) != 'undefined' && x != null)
            this.sprite.x_pos = x;

        if (typeof(y) != 'undefined' && y != null)            
            this.sprite.y_pos = y;
    }


    //-----------------------------------------------------------------------------
    // Return the position of the sprite
    //-----------------------------------------------------------------------------
    get_position() {
        return {
            x_pos: this.sprite.x_pos,
            y_pos: this.sprite.y_pos
        };
    }

    //-----------------------------------------------------------------------------
    // Draw the sprite with an offset, allowing you to use any point 
    // not just top left as the control (position) point.
    //-----------------------------------------------------------------------------
    set_sprite_offset(x_offset, y_offset) {
        this.sprite.x_offset = x_offset;
        this.sprite.y_offset = y_offset;
    } 

    //-----------------------------------------------------------------------------
    // Set the sprite offset position based on the width and height of the 
    // sprite image.
    //-----------------------------------------------------------------------------
    set_sprite_offset_center() {
        this.sprite.x_offset = -(Math.round(this.sprite.width / 2));
        this.sprite.y_offset = -(Math.round(this.sprite.height / 2));
    }

    //-----------------------------------------------------------------------------
    // Helper function to create a random number
    //-----------------------------------------------------------------------------
    randomIntFromInterval(min,max)
    {
        return Math.floor(Math.random()*(max-min+1)+min);
    }


    //-----------------------------------------------------------------------------
    // Load Sprite Image
    // Load a sprite graphic - 
    //          path            -- path to the image
    //          sprite width    -- width of individual frame of sprite
    //          sprite height   -- height of indiviual frame of sprite
    //          num_sprites     -- total number of sprites in the graphic image
    //          pixel_border    -- border around sprite
    //-----------------------------------------------------------------------------    
    load_sprite_image(path, sprite_width, sprite_height, num_sprites, pixel_border) {
        
        this.sprite.width = sprite_width;
        this.sprite.height = sprite_height;

        if (typeof pixel_border == 'undefined')
            this.sprite.pixel_border = 0;
        else
            this.sprite.pixel_border = pixel_border;     

        //this.num_sprites = num_sprites;
                
        // Load our image - moved actual load code to the game surface
        return this.load_image(path);
        
        /*
        var self = this;
        var promise = new Promise(function(resolve, reject) {
            self.load_image(path)
            .then(function(){
                resolve('Success');
            },function() {
                reject('Cannot find image ' + path);
            });
        });
        return promise;
        */        
    }


    //-----------------------------------------------------------------------------
    // Set an animation sequence
    // Sets an animation sequence for a sprite
    //
    // sequence_index       -- indes of the animation sequence - also the row
    //                          in the sprite graphic
    // speed                -- how many screen refreshes before we move on to the
    //                          next frame in the animation
    // frame_start          -- where to start this animation sequence
    // frame_end            -- where to end this animation sequence
    //-----------------------------------------------------------------------------
    set_animation_sequence(sequence_index, speed, frame_start, frame_end, repeat) {

        // 0 repeat
        // 1 or > repeat that many times
        // -1 repeat once
        if (repeat == undefined)
            repeat = 0;

        var anim = {            
            frame_end: frame_end,           // Last frame in this sequence
            frame_start: frame_start,       // First frame in this sequence
            frame_current: frame_start,     // Current Frame - where we are in the animation sequence.            
            screen_count: 0,                // Current Count of screen re-draw
            speed: speed,                   // How many screen re-draws before next frame
            repeat: repeat,                 // should the animation sequence repeat?
            repeat_count: 0                 // how many times has we repeated?

        };


        if (repeat > 0) {
            anim.repeat_count = 0;
            anim.repeat = repeat;            
        }



        // Store this animation sequence.
        this.sprite.animation_sequence_data[sequence_index] = anim;

    }


    //-----------------------------------------------------------------------------
    // Set a particular frame for the current sequence
    //-----------------------------------------------------------------------------
    set_animation_frame(sequence_index, frame) {

        if (sequence_index < 0 || sequence_index > this.sprite.animation_sequence_data.length) {
            console.log('error fame does not exist');
            return false;
        }

        var animObj = this.sprite.animation_sequence_data[sequence_index];
        if (frame <0 || frame > animObj.frame_end) {
            console.log('frame does not exist');
            return false;
        }

        animObj.frame_current = frame;
        
        
    }


    //-----------------------------------------------------------------------------
    // update_animation 
    // Called internally by the draw function 
    // This will update the animation details of a sprite selecting which 
    // particular sprite to draw.
    //-----------------------------------------------------------------------------
    update_animation() {

        // Are we animating this sprite?
        if (this.sprite.animate==false)
            return;

        // Get the data for this animation sequence            
        var sprite_data = this.sprite.animation_sequence_data[this.sprite.animation_sequence];


        // Only run the animation sequence once            
        if (sprite_data.repeat == -1 && 
            sprite_data.frame_current >= sprite_data.frame_end ) 
        {
            return;
        }          
        

        sprite_data.screen_count ++;

        // Move to next frame
        if (sprite_data.screen_count >= sprite_data.speed) {

            sprite_data.frame_current ++;       // Move next frame
            sprite_data.screen_count = 0;       // Reset screen count         

            // Repeat animation X number of times            
            if (sprite_data.repeat > 0 && 
                sprite_data.repeat_count >= sprite_data.repeat-1) 
            {
                return;   
            }


            // Move back to start of animation
            if (sprite_data.frame_current > sprite_data.frame_end) {
                sprite_data.frame_current = sprite_data.frame_start;

                if (sprite_data.repeat > 0)
                    sprite_data.repeat_count ++;
            }

            // reset our count.                
            sprite_data.screen_count = 0;                
        }    
    }


    //-----------------------------------------------------------------------------
    // Start the animation sequence (allow animation sequence to run)
    //-----------------------------------------------------------------------------
    animate_start(frame) {
        this.sprite.animate = true;
    }

    //-----------------------------------------------------------------------------
    // Stop the animation sequence
    //-----------------------------------------------------------------------------
    animate_stop() {
        this.sprite.animate = false;
    }

    
    set_animation_sequence_current(sequence) {

        if (sequence >= 0  && sequence < this.sprite.animation_sequence_data.length) {
            this.sprite.animation_sequence = sequence;
        }
        else {
            if (this.sprite.debug)        
                console.log('Invalid Animation sequence Selected - Please set the animation sequence first');
        }
    }

    


    //-----------------------------------------------------------------------------
    // Draw a particular sprite
    //-----------------------------------------------------------------------------
    draw_sprite(context, sprite_sequence, x, y, sprite) {

        // Find the src coordinates of the sprite we need.
        var src_y = 0;
        var src_x = 0;


        // We are using the sprite animation - wowzers.
        var sprite_data = this.sprite.animation_sequence_data[sprite_sequence];

        // Each animation sequence in expected to have its own row in the sprite
        // graphic - yeah I know but it makes things easier :)
        src_y = (sprite_sequence * this.sprite.height) +  (sprite_sequence * this.sprite.pixel_border) + this.sprite.pixel_border;
        src_x = (sprite * this.sprite.width) + (sprite * this.sprite.pixel_border) + this.sprite.pixel_border;
      
        //context.globalCompositeOperation = "hard-light";
        //this.surface.canvas.globalCompositeOperation = "screen";
        //this.surface.canvas.globalCompositeOperation = "screen";            

        context.drawImage(this.surface.canvas,
                    src_x,//this.sprite * this.sprite_width, 
                    src_y, 
                    this.sprite.width, 
                    this.sprite.height,
                    x,
                    y,
                    this.sprite.width,
                    this.sprite.height);



    }

    //-----------------------------------------------------------------------------
    // Draw the current sprite
    //-----------------------------------------------------------------------------
    draw(context) {

        
        // Find the src coordinates of the sprite we need.
        var src_y = 0;
        var src_x = 0;


        // We are using the sprite animation - wowzers.
        var sprite_data = this.sprite.animation_sequence_data[this.sprite.animation_sequence];

        // Each animation sequence in expected to have its own row in the sprite
        // graphic - yeah I know but it makes things easier :)
        src_y = (this.sprite.animation_sequence * this.sprite.height) +  (this.sprite.animation_sequence * this.sprite.pixel_border) + this.sprite.pixel_border;
        src_x = (sprite_data.frame_current * this.sprite.width) + (sprite_data.frame_current * this.sprite.pixel_border) + this.sprite.pixel_border;
      
        //context.globalCompositeOperation = "hard-light";
        //this.surface.canvas.globalCompositeOperation = "screen";
        //this.surface.canvas.globalCompositeOperation = "screen";            

        context.drawImage(this.surface.canvas,
                    src_x,//this.sprite * this.sprite_width, 
                    src_y, 
                    this.sprite.width, 
                    this.sprite.height,
                    this.sprite.x_pos + this.sprite.x_offset,
                    this.sprite.y_pos + this.sprite.y_offset, 
                    this.sprite.width,
                    this.sprite.height);



        // If an animation sequence has been setup for this sprite
        // this will takecare of updating the sprite informaton when
        // drawing.
        this.update_animation();


        // If we are debuging - show somw debug info
        if (this.sprite.debug) {

            var x = this.sprite.x_pos + this.sprite.x_offset;
            var y = this.sprite.y_pos + this.sprite.y_offset;

            // Text output position.
            context.font = "12pt serif";
            context.fillStyle = '#ffffff';
            context.fillText('(X=' + x + ', Y=' + y + ')', 
                x + 20 + this.sprite.width, 
                y + 20);

            // Show Center point.
            context.fillRect(this.sprite.x_pos, this.sprite.y_pos, 4, 4);
        }
    }

}
