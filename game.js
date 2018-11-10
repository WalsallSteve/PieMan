class pman_game {
    constructor() {
        
        this.data = {            
            map: false,
            pman: false,
            game: false,
            splash: false,
            prize: false,
            ghosts: [],
            audio: false,
            direction_x: null,
            direction_y: null            
        };

        this.game_data = {
            level: 0,
            lives: 3,
            tiles_eaten: 0,
            score: 0,
            message_count: 150,
            message: '',            
            restart_level_count: 0,
            draw_ghosts: true,   
            state:0, 
            game_over_count: 200,
            siren_sound_on: false         
        };

        this.game_stateEnum = {
            SPLASH_SCREEN_FADE_IN: 0,
            SPLASH_SCREEN_FADE_OUT: 1,
            GAME_FADE_IN: 2,
            GAME_FADE_OUT: 3
        };


        this.game_levels = [
            { 
                pman_speed: 5,
                ghost_speed: 4,
                attack: 30,
                scatter: 8
            },
            { 
                pman_speed: 5,
                ghost_speed: 4,
                attack: 40,
                scatter: 6
            },
            { 
                pman_speed: 5,
                ghost_speed: 4,
                attack: 50,
                scatter: 4
            },
            { 
                pman_speed: 6,
                ghost_speed: 5,
                attack: 30,
                scatter: 8
            },
            { 
                pman_speed: 6,
                ghost_speed: 5,
                attack: 40,
                scatter: 6
            },
            { 
                pman_speed: 6,
                ghost_speed: 5,
                attack: 50,
                scatter: 4
            },
            { 
                pman_speed: 6,
                ghost_speed: 6,
                attack: 30,
                scatter: 8
            },
            { 
                pman_speed: 6,
                ghost_speed: 6,
                attack: 40,
                scatter: 6
            },
            { 
                pman_speed: 6,
                ghost_speed: 6,
                attack: 50,
                scatter: 4
            },
            { 
                pman_speed: 5,
                ghost_speed: 7,
                attack: 30,
                scatter: 8
            },
            { 
                pman_speed: 5,
                ghost_speed: 7,
                attack: 40,
                scatter: 6
            },
            { 
                pman_speed: 5,
                ghost_speed: 7,
                attack: 50,
                scatter: 4
            }
        ];


        // Create the map - sprites etc.
        this.initialise();
    }



    //-----------------------------------------------------------------------------
    // Key down
    //-----------------------------------------------------------------------------
    key_down(self, event) {
    //    console.log('key down');
     //   console.log(self);
     //   console.log(event);

        if (event.key == 'ArrowUp' || event.key == 'ArrowDown')
            this.data.direction_y = event.key;

        if (event.key == 'ArrowLeft' || event.key == 'ArrowRight')            
            this.data.direction_x = event.key;

        if (event.code == 'Space') {
            
            this.data.extra_data.game_data.state = this.data.extra_data.game_stateEnum.SPLASH_SCREEN_FADE_OUT;


            //console.log(this);
            //console.log(self);
            
        }
        //console.log(this.direction_y);
    }

    //-----------------------------------------------------------------------------
    // Key up
    //-----------------------------------------------------------------------------
    key_up(self, event) {

        // If key up and that key is the same as the current direction            
        if (this.data.direction_y != null && this.data.direction_y == event.key)
            this.data.direction_y = null;            

        // If key up and that key is the same as the current direction            
        if (this.data.direction_x != null && this.data.direction_x == event.key)
            this.data.direction_x = null;            
    }



    //-----------------------------------------------------------------------------
    // Main loop of the game 
    // This has been set as the main loop in the game engine - it will be called
    // 30 - 60 times a second approx
    //-----------------------------------------------------------------------------
    main_loop(self) {

        
        // Draw items
        self.data.game.clear();                     // clear screen

        if (self.game_data.state == self.game_stateEnum.SPLASH_SCREEN_FADE_IN) {

            self.data.game.draw_image(self.data.splash, 0, 0);
            self.data.game.fade_in_loop(1);  
            self.data.audio.play('merry_xmas');          
        }
        else if (self.game_data.state == self.game_stateEnum.SPLASH_SCREEN_FADE_OUT) {

            self.data.game.draw_image(self.data.splash, 0, 0);
            if (self.data.game.fade_out_loop(1) == true) {           
                self.data.audio.stop('merry_xmas');
                self.game_data.state = self.game_stateEnum.GAME_FADE_IN;

                self.data.audio.play('intro');

                self.game_data.lives = 3;
                self.game_data.level = 0;
                self.game_data.score = 0;
                self.game_data.tiles_eaten = 0;
                self.game_data.game_over_count = 200;
                self.initialise_map();
            }

        }
        else {

            if (self.game_data.state == self.game_stateEnum.GAME_FADE_IN) {
                self.data.game.fade_in_loop(1);  
            }

            if (self.game_data.state == self.game_stateEnum.GAME_FADE_OUT) {
                if (self.data.game.fade_out_loop(1) == true)
                    self.game_data.state = self.game_stateEnum.SPLASH_SCREEN_FADE_IN;
            }
        

            self.data.game.draw(self.data.map);         // draw map
            // score
            self.data.game.set_text_font('30pt Arial');
            self.data.game.text_write('Score ' + self.game_data.score, 100, 744);

            // level            
            self.data.game.set_text_font('30pt Arial');
            self.data.game.text_write('Level ' + Number(self.game_data.level +1), 330, 744);



            var i = 0;
            for (i = 0; i < self.game_data.lives; i ++) {
                self.data.game.draw_sprite(self.data.pman, 1, 550 + (i*34), 712, 5);
            }
            
            

            
            // Move pman
            if (self.game_data.message_count == 0) 
                self.data.pman.move(self.data.map, this.data.direction_x, this.data.direction_y);


            // Check if we can eat the tile
            self.check_eat_tile();

            // did we scoff some pie
            self.check_eat_pie();


            // draw pie
            self.data.game.draw(self.data.prize, 0, 0);


            // Draw pman
            self.data.game.draw(self.data.pman);

            // Ghost logic and drawing              
            if (self.game_data.draw_ghosts) {
                i = 0;
                var pos = self.data.pman.get_position();                
                for (i = 0; i < self.data.ghosts.length; i ++) {
                //for (i = 0; i < 1; i ++) {
                    self.data.ghosts[i].set_pmans_location(pos.x_pos, pos.y_pos, pos.direction);
                    //self.data.ghosts[i].set_debug(1);

                    if (i == 0 && self.game_data.message_count) {
                        // do nothing
                    } else {
                        self.data.ghosts[i].ghost_logic(self.data.map, self.game_data.message_count);    
                    }
                    self.data.ghosts[i].set_red_ghost_pos(self.data.ghosts[0].get_position());
                    self.data.game.draw(self.data.ghosts[i]);   // draw sprite
                }
            }


            // Check if pacman can eat the ghost
            self.check_eat_ghost();


            // Draw ready message
            self.draw_ready_message();

            // DRaw the game over message
            self.draw_game_over_message();

            // restart level - shod we restart the level
            self.restart_level();
            

//            self.data.audio.play('siren');

            // Has ghost killed pman?
            self.check_eat_pman();
            
        }
    }


    start_siren(self) {
        self.data.audio.play('siren', 1);
    }


    //-----------------------------------------------------------------------------
    // Draw the ready message
    //-----------------------------------------------------------------------------
    draw_ready_message() {

        if (this.game_data.message_count > 0) {

            this.data.game.set_text_font('30pt Impact');
            this.data.game.set_text_color('#ffffff');
            //this.data.game.text_write(self.game_data.message, 200, 444);            
            this.data.game.text_write('Ready!', 330, 414);            
            this.game_data.message_count --;
            
        }
    }


    //-----------------------------------------------------------------------------
    // Draw the ready message
    //-----------------------------------------------------------------------------
    draw_game_over_message() {

        if (this.game_data.state  == this.game_stateEnum.SPLASH_SCREEN_FADE_IN)
            return;


        if (this.game_data.game_over_count > 0 && this.game_data.lives == 0 ) {

            this.data.game.set_text_font('30pt Impact');
            this.data.game.set_text_color('#ffffff');
            //this.data.game.text_write(self.game_data.message, 200, 444);            
            this.data.game.text_write('Game Over!', 295, 414);            
            this.game_data.game_over_count --;       

        }
        else if (this.game_data.game_over_count == 0 && this.game_data.lives == 0 ) {
            this.game_data.state = this.game_stateEnum.GAME_FADE_OUT;
        }
    }


    //-----------------------------------------------------------------------------
    // Restart level
    //-----------------------------------------------------------------------------
    restart_level() {
        
        

        if (this.data.pman.sprite.status == this.data.pman.statusEnum.DYING) {
            
            this.game_data.restart_level_count++;            
            if (this.game_data.restart_level_count >= 100) {

                if (this.game_data.lives > 0 )
                {
                    // Re game chars
                    this.initialise_pman();
                    this.initialise_ghosts();                    

                    if (this.data.audio.is_playing('intro')==false)
                        this.data.audio.play('siren', 1);

                    // Makre sure wew re-draw the ghosts now
                    this.game_data.draw_ghosts = true;  
                    
                    // reset our wait counter
                    this.game_data.restart_level_count = 0;

                    // set our ready text
                    this.game_data.message_count = 50;
                }
                else {
                    console.log('end game');
                }

            }
        }
    }





    //-----------------------------------------------------------------------------
    // Has pman died?
    //-----------------------------------------------------------------------------
    check_eat_pman() {

        var pman_pos = this.data.pman.get_position();
        var pman_tile = this.data.map.get_map_tile_number_pixel_coords(pman_pos.x_pos, pman_pos.y_pos);

        var i = 0;
        var len = this.data.ghosts.length;
        var ghost_pos, ghost_tile = 0;        
        for (i = 0; i < len; i ++) {

            ghost_pos = this.data.ghosts[i].get_position();
            ghost_tile = this.data.map.get_map_tile_number_pixel_coords(ghost_pos.x_pos, ghost_pos.y_pos);

            if (this.data.ghosts[i].sprite.status == this.data.ghosts[i].statusEnum.ALIVE) {
                if (ghost_tile == pman_tile && this.data.pman.sprite.status == this.data.pman.statusEnum.ALIVE) {
                    
                    // kill pman
                    this.data.pman.die_pman_die();                    

                    this.data.audio.stop('siren');
                    this.data.audio.play('pacman_die');

                    // stop drawing ghosts
                    this.game_data.draw_ghosts = false;

                    this.game_data.lives --;
                }
            }
        }
    }




    //-----------------------------------------------------------------------------
    // Check did we get some pie
    //-----------------------------------------------------------------------------
    check_eat_pie() {

        
        var pman_pos = this.data.pman.get_position();
        var eaten = this.data.prize.check_eat_pie(this.data.map, pman_pos.x_pos, pman_pos.y_pos);
        if (eaten) {

            if (eaten==1)
                this.data.audio.play('mmmpie');
            else if (eaten==2)                
                this.data.audio.play('lovecane');                   
            else
                this.data.audio.play('lovebox');             
            //console.log('eaten pie');
        }


    }


    //-----------------------------------------------------------------------------
    // Check if we can eat a ghost
    //-----------------------------------------------------------------------------
    check_eat_ghost() {
        
        var pman_pos = this.data.pman.get_position();
        var pman_tile = this.data.map.get_map_tile_number_pixel_coords(pman_pos.x_pos, pman_pos.y_pos);

        var i = 0;
        var len = this.data.ghosts.length;
        var ghost_pos, ghost_tile = 0;        
        for (i = 0; i < len; i ++) {

            ghost_pos = this.data.ghosts[i].get_position();
            ghost_tile = this.data.map.get_map_tile_number_pixel_coords(ghost_pos.x_pos, ghost_pos.y_pos);

            if (this.data.ghosts[i].sprite.status == this.data.ghosts[i].statusEnum.SCARED) {
                if (ghost_tile == pman_tile) {
                    this.data.ghosts[i].kill_ghost();
                    this.game_data.score += 100;
                    this.data.audio.play('eat_ghost');
                    //console.log('kill ghost');
                }
            }
        }
    }


    //-----------------------------------------------------------------------------
    // Check if we can eat a tile
    //-----------------------------------------------------------------------------
    check_eat_tile() {

        var pman_pos = this.data.pman.get_position();
        var tile = this.data.map.get_map_tile_pixel_coords(pman_pos.x_pos, pman_pos.y_pos);

        if (tile== '.' || tile == 'p') {

            // Can we eat a tile?
            if (tile == '.') {

                this.data.audio.play('waka');             

                this.game_data.tiles_eaten ++;
                this.game_data.score += 10;

                //console.log('Eaten' + this.game_data.tiles_eaten);
                
                if (this.game_data.tiles_eaten == 70 || this.game_data.tiles_eaten == 170)
                    this.data.prize.trigger_run();
                if (this.game_data.tiles_eaten == 238) {

                    // re -initialise the characters
                    this.game_data.tiles_eaten = 0;
                    this.game_data.level ++; 
                    this.game_data.message_count = 50;

                    
                    // Show new Level Item                    
                    this.initialise_pman();
                    this.initialise_ghosts();

                    this.data.audio.stop('siren');
                    this.data.audio.play('intro');

                    this.game_data.message = 'Level' + Number(this.game_data.level + 1);
                    pman_pos = this.data.pman.get_position();
                    
                    this.initialise_map();
                    
                    //console.log('Level complete');
                }
            }

            // Eat power pie
            if (tile == 'p') {

                // Set the ghost scared mode.
                for(var i = 0; i < this.data.ghosts.length; i ++) {
                    this.data.ghosts[i].set_scared_mode();                    
                }

                this.data.audio.play('eat_pill');

                //console.log('Pie');
            }

            // Clear the map tile.
            this.data.map.set_map_tile_pixel_coords(' ', pman_pos.x_pos, pman_pos.y_pos);

        }
            
    }


    

    //-----------------------------------------------------------------------------
    // Start by building the items required for the game
    //-----------------------------------------------------------------------------
    initialise() {

            
        // Create objects for map and sprites
        this.data.pman = new pacman();
        this.data.prize = new prize();
        this.data.map = new game_mapper();        
        this.data.game = new game_engine();
        this.data.splash = new game_surface();        
        this.data.audio = new game_audio();

        for (var i = 0; i < 4; i++)
            this.data.ghosts[i] = new ghost();


        // Initialise each element
        this.initialise_map();            
        this.initialise_pman();
        this.initialise_ghosts();

        this.data.audio.initialise();

        // Create the window        
        this.data.game.set_text_font('Arial 14pt');
        //this.data.game.window_create(872, 768, 0);
        this.data.game.window_create(776, 768, 0);
        this.data.game.set_clipping_rect(48, 0, 672, 768);

        this.data.game.keydown = this.key_down;
        this.data.game.keyup = this.key_up;

        
        // store as this gets overwritten
        var self = this;

        // Load all of the graphics required
        var promise = new Array(
            this.data.splash.load_image('images/splash_screen.png'),
            this.data.map.load_map_image('images/map.png', 24, 24, 1),
            this.data.pman.load_sprite_image('images/pman.png', 40,40, 5, 1),
            this.data.prize.load_sprite_image('images/prize.png', 40, 40, 1, 1),

            this.data.ghosts[0].load_sprite_image('images/ghost_red.png', 40, 40, 3, 1),
            this.data.ghosts[1].load_sprite_image('images/ghost_pink.png', 40, 40, 3, 1),
            this.data.ghosts[2].load_sprite_image('images/ghost_cyan.png', 40, 40, 3, 1),
            this.data.ghosts[3].load_sprite_image('images/ghost_yellow.png', 40, 40, 3, 1),

            this.data.audio.load_audio('sounds/mmmpie.ogg', 'mmmpie'),
            this.data.audio.load_audio('sounds/love_box.ogg', 'lovebox'),
            this.data.audio.load_audio('sounds/love_cane.ogg', 'lovecane'),
            this.data.audio.load_audio('sounds/pacman_waka.ogg', 'waka'),
            this.data.audio.load_audio('sounds/pacman_intro.ogg', 'intro'),
            this.data.audio.load_audio('sounds/pacman_siren.ogg', 'siren'),
            this.data.audio.load_audio('sounds/pacman_die_pman.ogg', 'pacman_die'),
            this.data.audio.load_audio('sounds/pacman_eat_ghost.ogg', 'eat_ghost'),
            this.data.audio.load_audio('sounds/pacman_eat_fruit.ogg', 'eat_pill'),
            this.data.audio.load_audio('sounds/merry_christmas.mp3', 'merry_xmas')


        )

        Promise.all(promise)
        .then(function(){
            
            self.data.audio.set_trigger_on_end(self, 'intro', self.start_siren);
                        
            //self.show_splash_screen();

            for (var i = 0; i < 3; i ++)
                self.data.prize.set_animation_sequence(i, 0, 0, 0, 0);
            self.data.prize.set_sprite_offset_center();


            // set initial fade state
            self.data.game.fade_out_loop(0, 0);
            
            //self.data.game.draw(self.data.map);

            //self.data.ghosts[0].set_position(14*24, 10 * 24);
            for(var i =0; i < self.data.ghosts.length; i ++) {
                self.data.ghosts[i].set_sprite_offset_center(); 
                //self.data.ghosts[i].set_clipping_color();
            }
            
            self.data.pman.set_sprite_offset_center();                


            self.data.game.draw(self.data.ghosts[0]);
            self.data.game.draw(self.data.ghosts[1]);
            self.data.game.draw(self.data.ghosts[2]);
            self.data.game.draw(self.data.ghosts[3]);

            self.data.game.set_text_color('#ffffff');            
            //self.data.map.draw_grid(self.data.game.surface.context, 24, 24, 1, 1); 
                        
            
            self.game_data.message_count = 50;
            self.game_data.message = 'Level' + Number(self.game_data.level + 1);


            self.data.game.run = self.main_loop;
            self.data.game.game_start(self);


        },function(error){           
           console.log(error);
        });

    }

/*
    show_splash_screen() {

        this.data.game.fade_out(this.data.splash, 0.01);
        this.data.game.draw_image(this.data.splash, 0, 0);
        this.data.game.fade_in(this.data.splash, 1);
        
        this.data.audio.play('merry_xmas');

        //this.data.game.fade_out(this.data.splash, 1);
        //this.data.game.draw_image(this.data.splash,1 );
        //this.data.splash.draw_image(this.data.game.surface.context, 0, 0);
        //this.data.game.fade_in(this.data.splash, 3);
//        this.data.game.draw_image(this.data.splash, 0, 0, 768, 600);
   //     this.data.splash.draw_image(this.data.game.surface.context, 0, 0);
        

    }
*/

    //-----------------------------------------------------------------------------
    // Set up for the map
    //-----------------------------------------------------------------------------
    initialise_map() {

        var map_key = new Array('.', '═', '║', '╔', '╗', '╚', '╝', '│', '─', '┌', '┐', '└', '┘', 'p','l','r','x');
        var map_data = "  ╔══════════════════════════╗  " +
                        "  ║............││............║  " +
                        "  ║.┌──┐.┌───┐.││.┌───┐.┌──┐.║  " +
                        "  ║p│  │.│   │.││.│   │.│  │p║  " +
                        "  ║.└──┘.└───┘.└┘.└───┘.└──┘.║  " +
                        "  ║..........................║  " +
                        "  ║.┌──┐.┌┐.┌──────┐.┌┐.┌──┐.║  " +
                        "  ║.└──┘.││.└──┐┌──┘.││.└──┘.║  " +
                        "  ║......││....││....││......║  " +
                        "  ╚════╗.│└──┐ ││ ┌──┘│.╔════╝  " +
                        "       ║.│┌──┘ └┘ └──┐│.║       " +
                        "       ║.││          ││.║       " +
                        "       ║.││ ╔═lxxr═╗ ││.║       " +
                        "═══════╝.└┘ ║      ║ └┘.╚═══════" +
                        "        .   ║      ║   .        " +
                        "═══════╗.┌┐ ╚══════╝ ┌┐.╔═══════" +
                        "       ║.││          ││.║       " +
                        "       ║.││ ┌──────┐ ││.║       " +
                        "  ╔════╝.└┘ └──┐┌──┘ └┘.╚════╗  " +
                        "  ║............││............║  " +
                        "  ║.┌──┐.┌───┐.││.┌───┐.┌──┐.║  " +
                        "  ║p└─┐│.└───┘.└┘.└───┘.│┌─┘p║  " +
                        "  ║...││.......  .......││...║  " +
                        "  ║─┐.││.┌┐.┌──────┐.┌┐.││.┌─║  " +
                        "  ║─┘.└┘.││.└──┐┌──┘.││.└┘.└─║  " +
                        "  ║......││....││....││......║  " +
                        "  ║.┌────┘└──┐.││.┌──┘└────┐.║  " +
                        "  ║.└────────┘.└┘.└────────┘.║  " +
                        "  ║..........................║  " +
                        "  ╚══════════════════════════╝  ";

        this.data.map.set_map_key(map_key);                        
        this.data.map.set_map_data(map_data, 32,30);      // Set the map data - 28 tiles X 30 tiles

    }



    //-----------------------------------------------------------------------------
    // Set up for the ghosts
    //-----------------------------------------------------------------------------
    initialise_ghosts() {

        // Set up the ghosts animaton sequences for the ghost movement
        for (var i = 0; i < this.data.ghosts.length; i ++) {
            for (var s=0; s<7; s++) {
                this.data.ghosts[i].set_animation_sequence(s, 4, 0, 3);                   
            }                        
            this.data.ghosts[i].set_sprite_status_alive();
            this.data.ghosts[i].set_attack_method(i);                
            this.data.ghosts[i].animate_start();      
        }


        // Set each ghosts start position.
        //this.data.ghosts[0].set_position(12 * 24, 12*24 + 12);
        this.data.ghosts[0].set_position(16 * 24, 11 * 24 + 12);    // red
        this.data.ghosts[1].set_position(16 * 24, 14 * 24 + 12);    // pink
        this.data.ghosts[2].set_position(14 * 24, 14 * 24 + 12);    // cyan
        this.data.ghosts[3].set_position(18 * 24, 14 * 24 + 12);    // yellow

        // Set ghost target for escaping ghost house.
        this.data.ghosts[0].set_initial_target(372, 280);               // red
        this.data.ghosts[1].set_initial_target(372, 280);               // pink
        this.data.ghosts[2].set_initial_target(372, 280);               // cyan
        this.data.ghosts[3].set_initial_target(372, 280);               // yellow

        // default speed.
        var speed = 4, attack = 30, scatter = 7;
        var num_levels = this.game_levels.length;
        if (this.game_data.level < num_levels) {
            speed = this.game_levels[this.game_data.level].ghost_speed;
            attack = this.game_levels[this.game_data.level].attack;
            scatter = this.game_levels[this.game_data.level].scatter;
        }

        for (var i = 0; i < this.data.ghosts.length; i ++) {
            this.data.ghosts[i].set_home_position(16 * 24, 14 * 24 + 12);
            this.data.ghosts[i].initialise();
            this.data.ghosts[i].set_speed(speed);
            this.data.ghosts[i].set_attack_count(attack);
            this.data.ghosts[i].set_scatter_count(scatter);
        }

        this.data.ghosts[1].ghost.release_count=20;
        this.data.ghosts[2].ghost.release_count=30;
        this.data.ghosts[3].ghost.release_count=40;



        // Set scatter locations.
        this.data.ghosts[0].set_scatter_target(24*24, 0);           // red
        this.data.ghosts[1].set_scatter_target(5*24, 0);            // pink
        this.data.ghosts[2].set_scatter_target(24*24, 28*24)        // cyan
        this.data.ghosts[3].set_scatter_target(3*24, 28*24)         // yellow

        
    }

    initialise_pman() {

        this.data.pman.initialise();

        for(var i = 0; i < 4; i++)
            this.data.pman.set_animation_sequence(i, 2, 0, 10);

        this.data.pman.set_animation_sequence(4, 3, 0, 11, -1);            

        this.data.pman.set_position(16 * 24, 22 * 24 + 12);
        
        this.data.pman.set_animation_sequence_current(3);            

        this.data.pman.animate_start();            
        
        this.data.pman.set_sprite_status_alive();
        

        var num_levels = this.game_levels.length;
        if (this.game_data.level < num_levels) {
            this.data.pman.set_speed(this.game_levels[this.game_data.level].pman_speed);
        }
        
        
        //this.data.pman.set_position(12 * 24 + 18, 22 * 24 + 12);
        //this.data.pman.set_position(12 * 24 + 16, 22 * 24 + 12);
    }



} // end class