class ghost extends game_sprite {
    constructor() {
        super();

        // Our ghost data
        this.ghost = {
            initial_target_x: 0,            // target to get out of house
            initial_target_y: 0,            // target to get out of house
            home_pos_x: 0,                  // position in the box - home pos and start pos will be the same for 
            home_pos_y: 0,                  // most ghosts - but one starts outside the box
            start_pos_x: 0,                 //
            start_pos_y: 0,                 //                        
            scatter_pos_x: 0,               // location in scatter mode
            scatter_pos_y: 0,               // 
            pman_pos_x:0,                   // pmans xpos
            pman_pos_y:0,                   // pmans ypos
            ghost_red_pos_x:0,              // red ghost position for calculating bule ghost attack
            ghost_red_pos_y:0,
            pman_direction:0,                // pmans directions
            scared_duration: 260,
            scared_count: 0,
            mode: 1,                        // what mode is the ghost in - scatter - attack
            mode_count: 0,                  // count up for a particular mode
            attack_count: 30,               // what attack count should we have
            scatter_count: 8,               // what scatter count should we have
            speed: 4,                       // how fast is our ghost
            speed_scared: 3,                // speed to move when scared
            speed_dead:5,                   // speed to move when dead
            attack_method: 0,               // method for locating pacman            
            direction_current: null,        // what direction is my ghost going                                
            direction_future: null,         // what direction will my ghost go next
            change_coords: false,           // Coordinate of when the change in direction should take place
            last_map_tile: 0,               // Detect if we move on to a new tilelast tile ghost on.  
            release_count: 50               // when 0 allow release from ghost house.                                                                        
        };

        // Ghost modes
        this.modeEnum = {
            SCATTER: 0,
            ATTACK: 1                                 
        };

        this.directionEnum = {
            UP: 0,
            RIGHT: 1,
            DOWN: 2,
            LEFT: 3
        };

    }


    //-----------------------------------------------------------------------------
    // Figure out what our ghost is supposed to be doing and where he is 
    // supposed to be going...
    // Called in main loop
    //-----------------------------------------------------------------------------
    
    // just for debugging - not needed
    draw(context) {

        var x = this.sprite.x_pos + this.sprite.x_offset;
        var y = this.sprite.y_pos + this.sprite.y_offset;

        context.fillStyle = '#ffffff';

        if (this.sprite.debug) {
            if (this.ghost.direction_current != null && this.ghost.direction_future != undefined) {
                context.fillText('Direction Current=' + this.ghost.direction_current.name, x + 20 + this.sprite.width, y + 40);
                context.fillText('Direction Future=' + this.ghost.direction_future.name, x + 20 + this.sprite.width, y + 60);
            }
        }
        //context.fillText('Target', 300, 280);
        super.draw(context);

    }
    

    //-----------------------------------------------------------------------------
    // Kill the ghost
    //-----------------------------------------------------------------------------
    kill_ghost() {

        // Stop the automatic animation
        this.animate_stop();

        // Set the status as dead (eyes)
        this.sprite.status = this.statusEnum.DEAD;
        this.set_animation_sequence_current(6);
        // set the sprite animation (eyes)
    }

    //-----------------------------------------------------------------------------
    // REanimate the ghost from the ghost house
    //-----------------------------------------------------------------------------
    re_animate_ghost() {

        this.sprite.status = this.statusEnum.ALIVE;
        this.set_animation_frame(0, 0);
        this.animate_start();
        
    }


    initialise() {

        this.ghost.release_count =  50;
        this.ghost.direction_current = null;        // what direction is my ghost going                                
        this.ghost.direction_future = null;         // what direction will my ghost go next
        this.ghost.change_coords = false;           //
        this.ghost.last_map_tile = 0;
        this.sprite.status = this.statusEnum.ALIVE;
        this.ghost.mode == this.modeEnum.ATTACK;
        this.ghost.mode_count = 0;
        this.set_animation_sequence_current(0);
                
    }

    //-----------------------------------------------------------------------------
    // Find target position
    //-----------------------------------------------------------------------------
    find_target_position(attack_method) {


        // red ghost
        // chase packman directly
        
        //pink ghost
        // select 4 tiles ahead of pacmans current direction
        
        // blue ghost 
        // select two tiles in front of packman draw a vector from red ghost to tile.  
        // Double length of vector and that is new tile
        
        // yellow ghost
        // same as red until within 8 tiles then target scatter location.
        
        var target = {
            target_x:0, 
            target_y:0
        };

        
        if (this.sprite.status == this.statusEnum.DEAD)
        {
            // Dead - go home
            target.target_x = this.ghost.home_pos_x;
            target.target_y = this.ghost.home_pos_y;
        } 
        else if (this.sprite.status == this.statusEnum.SCARED) {
            // Scared run away

            var game_width = 872;
            var game_height = 768;

            if (this.ghost.pman_pos_x > (game_width / 2))
                target.target_x = 0;
            else
                target.target_x = game_width;
                
                
            if (this.ghost.pman_pos_y > (game_height / 2))                
                target.target_y = 0;
            else
                target.target_y = game_height;                

            //target.target_x = this.ghost.home_pos_x;
            //target.target_y = this.ghost.home_pos_y;
        }
        else if (this.sprite.status == this.statusEnum.ALIVE && this.ghost.mode == this.modeEnum.SCATTER) {
            // Scatter - mkae ghost attack in waves
            target.target_x = this.ghost.scatter_pos_x;
            target.target_y = this.ghost.scatter_pos_y;
        }
        else if (this.sprite.status == this.statusEnum.ALIVE && this.ghost.mode == this.modeEnum.ATTACK) {
            // Alive attack
        
            if (attack_method == 0) {
                // Red
                target.target_x = this.ghost.pman_pos_x;
                target.target_y = this.ghost.pman_pos_y;
            }
            else if (attack_method == 1) {
                // pink
                //0=up
                //1=right
                //2=down
                //3=left
                var distance = 96;
                if (this.ghost.pman_direction == 0) {                
                    target.target_x = this.ghost.pman_pos_x;
                    target.target_y = this.ghost.pman_pos_y - distance;
                }
                else if (this.ghost.pman_direction == 1 ) {
                    target.target_x = this.ghost.pman_pos_x + distance;
                    target.target_y = this.ghost.pman_pos_y;
                }
                else if (this.ghost.pman_direction == 2){
                    target.target_x = this.ghost.pman_pos_x;
                    target.target_y = this.ghost.pman_pos_y + distance;
                }
                else {
                    target.target_x = this.ghost.pman_pos_x - distance;
                    target.target_y = this.ghost.pman_pos_y;
                }
            } 
            else if (attack_method == 2) {
                // tmp

                var distance = 96;
                var tmp_target_x = 0;
                var tmp_target_y = 0;

                if (this.ghost.pman_direction == 0) {                
                    tmp_target_x = this.ghost.pman_pos_x;
                    tmp_target_y = this.ghost.pman_pos_y - distance;
                }
                else if (this.ghost.pman_direction == 1 ) {
                    tmp_target_x = this.ghost.pman_pos_x + distance;
                    tmp_target_y = this.ghost.pman_pos_y;
                }
                else if (this.ghost.pman_direction == 2){
                    tmp_target_x = this.ghost.pman_pos_x;
                    tmp_target_y = this.ghost.pman_pos_y + distance;
                }
                else {
                    tmp_target_x = this.ghost.pman_pos_x - distance;
                    tmp_target_y = this.ghost.pman_pos_y;
                }

                // tmp target now 2 tiles in front of pman

                // calculate vector from red ghost to tmp_target
                var x = this.ghost.ghost_red_pos_x - tmp_target_x;
                var y = this.ghost.ghost_red_pos_y - tmp_target_y;

                x = x + tmp_target_x;
                y = y + tmp_target_y;
                

                target.target_x = x * 2;
                target.target_y = y * 2;
            }
            else if (attack_method == 3) {

                var current_distance = 0;
                var limit_distance = 196;

                var ghost_x = this.sprite.x_pos * this.sprite.x_pos;
                var ghost_y = this.sprite.y_pos * this.sprite.y_pos;

                var pman_x = this.ghost.pman_pos_x * this.ghost.pman_pos_x;
                var pman_y = this.ghost.pman_pos_y * this.ghost.pman_pos_y;

                var x = ghost_x - pman_x;
                var y = ghost_y - pman_y;

                if (x < 0 )
                    x = x *-1;

                if (y < 0 )                
                    y = y *-1;

                current_distance = Math.sqrt(x + y);

                //console.log(current_distance + '    ' + limit_distance)

                if (current_distance > limit_distance) {
                    target.target_x = this.ghost.pman_pos_x;
                    target.target_y = this.ghost.pman_pos_y;
                } else {
                    target.target_x = this.ghost.scatter_pos_x;
                    target.target_y = this.ghost.scatter_pos_y;
                }
            }
        }


        return target;

    }


    //-----------------------------------------------------------------------------
    // Ghost Logic
    // stop ghost release pause ghost release from ghost house while 
    // displaying message
    //-----------------------------------------------------------------------------
    ghost_logic(map, stop_ghost_release) {


        // Use AI to find a target tile - this will be different for each ghost
        // Set the location that the ghost should be heading to


        // figure out what mode our ghost should be in attack or
        // scatter
        if (this.ghost.mode == this.modeEnum.ATTACK) {
            this.ghost.mode_count ++;
            if (this.ghost.mode_count > this.ghost.attack_count) {
                this.ghost.mode_count = 0;
                this.ghost.mode = this.modeEnum.SCATTER;
            }            
        } else {
            this.ghost.mode_count ++;
            if (this.ghost.mode_count > this.ghost.scatter_count) {
                this.ghost.mode_count = 0;
                this.ghost.mode = this.modeEnum.ATTACK;
            }
        }




        var target_x = 0;
        var target_y = 0;

        if (this.in_ghost_house()) {
            target_x = this.ghost.initial_target_x;
            target_y = this.ghost.initial_target_y;

            // Re animate the ghost
            if (this.sprite.status == this.statusEnum.DEAD) {
                this.re_animate_ghost();
            }

        }
        else {

            var new_target = this.find_target_position(this.ghost.attack_method);            
            target_x = new_target.target_x;
            target_y = new_target.target_y;

        }
        

        //-------------------------------------------------------------------------------------------------
        // Tunnel - move ghost either side of screen for the tunnel
        //-------------------------------------------------------------------------------------------------
        var current_tile_pos = map.get_map_tile_position_pixel_coords(this.sprite.x_pos, this.sprite.y_pos);
        if (current_tile_pos.map_x >= 31 &&
            current_tile_pos.map_y == 14 &&
            this.ghost.direction_current.dEnum == this.directionEnum.RIGHT) {
            this.set_position(24, this.sprite.y_pos); 
            this.ghost.change_coords = false;           
        }

        if (current_tile_pos.map_x <= 1 &&
            current_tile_pos.map_y == 14 &&
            this.ghost.direction_current.dEnum == this.directionEnum.LEFT) {
                this.set_position(744, this.sprite.y_pos);
                this.ghost.change_coords = false;
            }

        //-------------------------------------------------------------------------------------------------

        
        // Do we have an initial travel direction?  
        // Find an initial direction of travel to get to our target
        if (this.ghost.direction_current == null) {
            var possible_directions = this.find_possible_directions(map, this.sprite.x_pos, this.sprite.y_pos);            
            var distance_of_travel = this.find_shortest_path(map, possible_directions, target_x, target_y, this.sprite.x_pos, this.sprite.y_pos);
            var direction = this.find_direction(distance_of_travel);

            // Set our initial direction of travel
            this.ghost.direction_current = direction;            
        }
        

        // Find the current tile number we are on - use to detect
        // if we move to another tile.
        var current_tile = map.get_map_tile_number_pixel_coords(this.sprite.x_pos, this.sprite.y_pos);

        // If we have a direction of travel - and we have entered a new map tile - figure out what
        // our new direction of travel would be.
        if ((this.ghost.direction_current != null) &&           // We have a current direction of travel
            (current_tile != this.ghost.last_map_tile) &&       // We have moved on to a new tile 
            (this.ghost.change_coords == false)) {              // We are not currently waiting for a change in direction.


            var tile_width = 24;
            var tile_height = 24;

            var sprite_next_x_pos = this.sprite.x_pos;
            var sprite_next_y_pos = this.sprite.y_pos;

            // Note this looks at the tile ahead then makes a decision about the direction of travel 
            if (this.ghost.direction_current.dEnum == this.directionEnum.UP)    { sprite_next_y_pos -= tile_height; }
            if (this.ghost.direction_current.dEnum == this.directionEnum.RIGHT) { sprite_next_x_pos += tile_width; }
            if (this.ghost.direction_current.dEnum == this.directionEnum.DOWN)  { sprite_next_y_pos += tile_height; }
            if (this.ghost.direction_current.dEnum == this.directionEnum.LEFT)  { sprite_next_x_pos -= tile_width; }

            // Figure out an initial travel direction.
            var possible_directions = this.find_possible_directions(map, sprite_next_x_pos, sprite_next_y_pos);            
            var distance_of_travel = this.find_shortest_path(map, possible_directions, target_x, target_y, this.sprite.x_pos, this.sprite.y_pos);
            this.ghost.direction_future = this.find_direction(distance_of_travel);

            // Store the tile we are currently on and our direction of travel
            this.ghost.last_map_tile = current_tile;
            
            // Store the x,y coordinate of the center of the future tile
            // we can use this to make sure the center point of the ghost is always in the 
            // center of the tile.
            this.ghost.change_coords = map.get_map_tile_position_pixel_coords(sprite_next_x_pos, sprite_next_y_pos);
            
        }

        


        // Set the amination sequence that we should be using based on the ghost direction
        // and condition
        
        if (this.sprite.status == this.statusEnum.ALIVE) {
            this.set_animation_sequence_current(this.ghost.direction_current.dEnum);
            this.animate_start();
            //this.sprite.animation_sequence = this.ghost.direction_current.dEnum;
        }
        else if (this.sprite.status == this.statusEnum.SCARED) {
            
            // Change mode back to alive
            if (this.ghost.scared_count < this.ghost.scared_duration) {
                this.ghost.scared_count ++;

                if (this.ghost.scared_count < 200)
                    this.set_animation_sequence_current(4);
                else
                this.set_animation_sequence_current(5);                                        
            }                
            else {
                this.sprite.status = this.statusEnum.ALIVE;                
            }         
        }
        else if (this.sprite.status == this.statusEnum.DEAD) {

            this.set_animation_sequence_current(6);            
            this.set_animation_frame(6, this.ghost.direction_current.dEnum);
        }



        // We should always have a new direction and the coordinates (offset on tile)
        // of where the change in direction should be.

        // Move UP ghost            
        var speed;
        if (this.sprite.status == this.statusEnum.ALIVE)
            speed = this.ghost.speed;
        else if (this.sprite.status == this.statusEnum.DEAD)     
            speed = this.ghost.speed_dead;
        else if (this.sprite.status == this.statusEnum.SCARED)
            speed = this.ghost.speed_scared;

        if (this.ghost.direction_current.dEnum == this.directionEnum.UP) {                
            if (this.sprite.y_pos - speed <= this.ghost.change_coords.center_y) {
                this.sprite.y_pos = this.ghost.change_coords.center_y;
                this.change_direction(stop_ghost_release);
            } else {
                this.sprite.y_pos -= speed;            
            }
        }
        else
        // Right
        if (this.ghost.direction_current.dEnum == this.directionEnum.RIGHT) {   
            if (this.sprite.x_pos + speed >= this.ghost.change_coords.center_x) {
                this.sprite.x_pos = this.ghost.change_coords.center_x;
                this.change_direction(stop_ghost_release);
            } else {
                this.sprite.x_pos += speed;
            }
        }
        else
        // Down
        if (this.ghost.direction_current.dEnum == this.directionEnum.DOWN) {                
            if (this.sprite.y_pos + speed >= this.ghost.change_coords.center_y) {
                this.sprite.y_pos = this.ghost.change_coords.center_y;
                this.change_direction(stop_ghost_release);
            } else {
                this.sprite.y_pos += speed;            
            }
        }
        else
        // Left
        if (this.ghost.direction_current.dEnum == this.directionEnum.LEFT) {                
            if (this.sprite.x_pos - speed <= this.ghost.change_coords.center_x) {
                this.sprite.x_pos = this.ghost.change_coords.center_x;
                this.change_direction(stop_ghost_release);
            } else {
                this.sprite.x_pos -= speed;            
            }
        }

    } // end ghost logic


    change_direction(stop_ghost_release) {

        if (this.ghost.release_count > 0 && !stop_ghost_release)
            this.ghost.release_count --;

        if(this.ghost.direction_future != undefined) {                    
            if (this.ghost.direction_current.dEnum != this.ghost.direction_future.dEnum) {
                this.ghost.direction_current.name = this.ghost.direction_future.name;
                this.ghost.direction_current.dEnum = this.ghost.direction_future.dEnum;
                this.ghost.direction_current.value = this.ghost.direction_future.value;
            }
        }

        this.ghost.change_coords = false;

    }

    //-----------------------------------------------------------------------------
    // Is the ghosts location inside the ghost house.
    //-----------------------------------------------------------------------------
    in_ghost_house() {

        var in_ghost_house = false;

        var ghost_house_left = (13 * 24) + 12;
        var ghost_house_right = ghost_house_left + (6 * 24) + 12;
        var ghost_house_top = (12 * 24) + 12;
        var ghost_house_bottom = ghost_house_top + 2 * 24 + 12;

        // is the ghost in the ghost house?
        var in_ghost_house = false;
        if ((this.sprite.x_pos >= ghost_house_left) && 
            (this.sprite.x_pos <= ghost_house_right) && 
            (this.sprite.y_pos >= ghost_house_top) &&
            (this.sprite.y_pos <= ghost_house_bottom)) 
            {
                in_ghost_house = true;
            }

        return in_ghost_house;            
        
    }

    //-----------------------------------------------------------------------------
    // Find possible directions of travel based on a sprites current position.
    // This will take sprites position in pixels - convert it to a map tile
    // and then find the tiles in the surrounding area.
    // It will take the current direction of travel in to account to stop 
    // reversing direction
    //
    //  map             -- the map object
    //  sprite_xpos     -- sprite_xpos -- or position you want to account for
    //  sprite_ypos     -- sprite_ypos -- or position you want to account for
    //-----------------------------------------------------------------------------
    find_possible_directions(map, sprite_xpos, sprite_ypos) {
                
        // Possible new directions
        var new_directions = [
            { name: 'UP',       dEnum: this.directionEnum.UP,    value: 1  },
            { name: 'RIGHT',    dEnum: this.directionEnum.RIGHT, value: 1  },
            { name: 'DOWN',     dEnum: this.directionEnum.DOWN,  value: 1  },
            { name: 'LEFT',     dEnum: this.directionEnum.LEFT,  value: 1  }
        ];

        // we can change direction - but we cannot reverse direction (normally)
        // So remove opposite directions from possibles
        var in_ghost_house = this.in_ghost_house();
        
        // Stop reverse direction.                 
        if (in_ghost_house == false)            
        {   // If we are not in the ghost house then we cannot reverse direction.   
            if (this.ghost.direction_current != null) {                
                if (this.ghost.direction_current.dEnum == this.directionEnum.UP)    { new_directions[this.directionEnum.DOWN].value     = 0; }
                if (this.ghost.direction_current.dEnum == this.directionEnum.RIGHT) { new_directions[this.directionEnum.LEFT].value     = 0; }
                if (this.ghost.direction_current.dEnum == this.directionEnum.DOWN)  { new_directions[this.directionEnum.UP].value       = 0; }
                if (this.ghost.direction_current.dEnum == this.directionEnum.LEFT)  { new_directions[this.directionEnum.RIGHT].value    = 0; }
            }
        }

        // If in ghost house and release count > 0;
        // stop left and right movement.
        if (in_ghost_house && this.ghost.release_count > 0) {
            // If we are in the ghost house restric left and right movement.
            new_directions[this.directionEnum.LEFT].value   = 0;
            new_directions[this.directionEnum.RIGHT].value  = 0;
        }


        // Do any of the surrounding tiles prevent movement ?
        // Remove direction available to travel based on the map tile
        var map_tiles = new Array(' ', '.','p');
        var surrounding_tiles = map.get_map_surrounding_tiles_pixel_coords(sprite_xpos, sprite_ypos);            

        // Allow ghost through door of ghost house.
        if (this.sprite.status == this.statusEnum.DEAD && surrounding_tiles[2].value=='x') {
            map_tiles.push('x');
        }
        else if (this.ghost.release_count == 0 && surrounding_tiles[0].value=='x') {
            map_tiles.push('x');
        }


        if (map_tiles.indexOf(surrounding_tiles[this.directionEnum.UP].value) == -1)
            new_directions[this.directionEnum.UP].value = 0;

        if (map_tiles.indexOf(surrounding_tiles[this.directionEnum.RIGHT].value) == -1)
            new_directions[this.directionEnum.RIGHT].value = 0;

        if (map_tiles.indexOf(surrounding_tiles[this.directionEnum.DOWN].value) == -1)
            new_directions[this.directionEnum.DOWN].value = 0;

        if (map_tiles.indexOf(surrounding_tiles[this.directionEnum.LEFT].value) == -1)
            new_directions[this.directionEnum.LEFT].value = 0;                                

        return new_directions;
    }


    //-----------------------------------------------------------------------------
    // Find the shortest distance to a target 
    // 
    //  Returns distances to a target based on direction.
    //
    //  map                 -- the map object
    //  new_directions      -- array of possible new directions 
    //  target_x            -- x_pos of target
    //  target_y            -- y_pos of target
    //  sprite_xpos         -- our current or future position
    //  sprite_ypos         -- our current or future position
    //
    //-----------------------------------------------------------------------------
    find_shortest_path(map, new_directions, target_x, target_y, sprite_xpos, sprite_ypos) {

        // Calculate the shortest distance to get to the location.
        var distance_of_travel = [
            { name: 'UP',       dEnum: this.directionEnum.UP,    value: 9999  },
            { name: 'RIGHT',    dEnum: this.directionEnum.RIGHT, value: 9999  },
            { name: 'DOWN',     dEnum: this.directionEnum.DOWN,  value: 9999  },
            { name: 'LEFT',     dEnum: this.directionEnum.LEFT,  value: 9999  }
        ];
            

        if (new_directions[this.directionEnum.UP].value) {
            // If we can travel up - based on our travel direction and map
            var pos_x = sprite_xpos - target_x;
            var pos_y = (sprite_ypos - map.map.tile_height) - target_y;
            distance_of_travel[this.directionEnum.UP].value = Math.round(Math.sqrt((pos_x * pos_x) + (pos_y * pos_y)));
        }

        if (new_directions[this.directionEnum.RIGHT].value) {
            // If we can travel up - based on our travel direction and map
            var pos_x = (sprite_xpos + map.map.tile_width) - target_x;
            var pos_y = sprite_ypos - target_y;
            distance_of_travel[this.directionEnum.RIGHT].value = Math.round(Math.sqrt((pos_x * pos_x) + (pos_y * pos_y)));
        }

        if (new_directions[this.directionEnum.DOWN].value) {
            // If we can travel up - based on our travel direction and map
            var pos_x = sprite_xpos - target_x;
            var pos_y = (sprite_ypos + map.map.tile_height) - target_y;
            distance_of_travel[this.directionEnum.DOWN].value = Math.round(Math.sqrt((pos_x * pos_x) + (pos_y * pos_y)));
        }

        if (new_directions[this.directionEnum.LEFT].value) {
            // If we can travel up - based on our travel direction and map  
            var pos_x = (sprite_xpos - map.map.tile_width) - target_x;
            var pos_y = sprite_ypos - target_y;
            distance_of_travel[this.directionEnum.LEFT].value = Math.round(Math.sqrt((pos_x * pos_x) + (pos_y * pos_y)));
        }

        return distance_of_travel;        
    }
    

    //-----------------------------------------------------------------------------
    // Takes distance of travel and finds an initial direction of travel    
    //-----------------------------------------------------------------------------
    find_direction(distance_of_travel) {

        // As the distance_of_travel array will be up, right, down, left
        // lets use this to find and set a order to the directions the ghost will follow.
        // note if two distances are the same it will select then in the order above

        var i, direction, last_val = 9999, len = distance_of_travel.length;
        for (i = 0; i < len; i ++) {
            if (distance_of_travel[i].value < last_val) {
                last_val = distance_of_travel[i].value;   // store last val for compare 
                direction = distance_of_travel[i];                                    
                }
        }
        return direction;
    }    



    //------------------------------------------------------------------
    // Set pacman's curent locations details
    //------------------------------------------------------------------
    set_pmans_location(x, y, direction) {
        this.ghost.pman_pos_x = x;
        this.ghost.pman_pos_y = y;
        this.ghost.pman_direction = direction;
    }


    //------------------------------------------------------------------
    // Set the scatter target
    //------------------------------------------------------------------
    set_scatter_target(x, y) {
        this.ghost.scatter_pos_x = x;
        this.ghost.scatter_pos_y = y;
    }


    //------------------------------------------------------------------
    // Set the attack method
    //------------------------------------------------------------------
    set_attack_method(method) {
        this.ghost.attack_method = method;
    }



    //------------------------------------------------------------------
    // Set the attack method
    //------------------------------------------------------------------
    set_red_ghost_pos(position) {

        this.ghost.ghost_red_pos_x = position.x_pos;
        this.ghost.ghost_red_pos_y = position.y_pos;        
    }


    //------------------------------------------------------------------
    // Set the ghost initial taget - escape ghost house
    //------------------------------------------------------------------
    set_initial_target(x, y) {
        this.ghost.initial_target_x = x;
        this.ghost.initial_target_y = y;
    }

    set_home_position(x, y) {
        this.ghost.home_pos_x = x;
        this.ghost.home_pos_y = y;
    }


    reverse_direction() {

        // Set our current direction as the opposite        
        if (this.ghost.direction_current.dEnum == this.directionEnum.UP)    { this.ghost.direction_current.dEnum = this.directionEnum.DOWN; }
        else if (this.ghost.direction_current.dEnum == this.directionEnum.DOWN)    { this.ghost.direction_current.dEnum = this.directionEnum.UP; }
        else if (this.ghost.direction_current.dEnum == this.directionEnum.LEFT)    { this.ghost.direction_current.dEnum = this.directionEnum.RIGHT; }
        else if (this.ghost.direction_current.dEnum == this.directionEnum.RIGHT)    { this.ghost.direction_current.dEnum = this.directionEnum.LEFT; }

        // for recalculation of future direction in ghost logic when called.
        this.ghost.direction_future = null;                
        this.ghost.last_map_tile = false;
       
        
    }


    set_scared_mode() {

        // set scared mode - if not already dead
        if (this.sprite.status == this.statusEnum.ALIVE || this.sprite.status == this.statusEnum.SCARED) {
            this.ghost.scared_count = 0;
            this.sprite.status = this.statusEnum.SCARED;
        }

        if (this.in_ghost_house() == false)
            this.reverse_direction();

        // select ghost random map position

        // Change ghost direction.
        //this.reverse_direction();

    }

    set_speed(speed) {
        speed = speed;
    }

    set_attack_count(count) {
        this.ghost.attack_count = count;
    }

    set_scatter_count(count) {
        this.ghost.scatter_count = count;
    }

}   // End class