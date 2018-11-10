class pacman extends game_sprite{
    constructor() {
        super();

        this.pman = {
            speed: 5,                       // current speed
            lives: 3,                       //??
            last_map_tile: 0,               // last tile pman on            
            corner_pre_pixels: 4,           // number of pixels we can use for cornering
            corner_post_pixels:-4,          // number of pixeks we can use for cornering
            possible_directions: null,      // obj of all possible directions from current tile
            tile_position_current: false,   // current center point of tile
            change_coords_x: false,
            change_coords_y: false,
            direction_current: 3,           // current direction of pman
            direction_changed: false        // have we changed direction around a corner - stop jitter when
                                            // have a choice of for example up or left at same time
            
        };

         this.directionEnum = {
            UP: 0,
            RIGHT: 1,
            DOWN: 2,
            LEFT: 3
        };


        // Create the map - sprites etc.
        //this.initialise();
    }


    initialise() {
        this.pman.possible_directions = null,
        this.pman.tile_position_current = false;
        this.pman.change_coords_x = false;
        this.pman.change_coords_y = false;
        this.pman.direction_current = 3;
        this.pman.direction_changed = false;
    }

   
    // Called when someone tried to move pman 
    move(map, move_x, move_y) {

        // Is the key down - do some movement?
        if (move_x==null && move_y==null)
            return;


        // My direction of travel
        if (this.sprite.status != this.statusEnum.ALIVE)
            return;


        // Get my current map tile.            
        var current_tile = map.get_map_tile_number_pixel_coords(this.sprite.x_pos, this.sprite.y_pos);        
        //if (current_tile != this.pman.last_map_tile)
        {
            var tile_width = 24;
            var tile_height = 24;

            this.pman.direction_changed = false;

            // Figure out directions we can travel - one tile infront.
            this.pman.possible_directions = this.find_possible_directions(map, this.sprite.x_pos, this.sprite.y_pos);                           
            var next_positions = {
                move_x: {
                    sprite_next_x: this.sprite.x_pos,
                    sprite_next_y: this.sprite.y_pos
                },
                move_y: {
                    sprite_next_x: this.sprite.x_pos,
                    sprite_next_y: this.sprite.y_pos
                }
            };


          
            // Find Our next tile requested tile locations based on keyboard input.            
            this.pman.tile_position_current = map.get_map_tile_position_pixel_coords(
                this.sprite.x_pos, this.sprite.y_pos);        
            if (move_x) {

                if (move_x == 'ArrowLeft' && this.pman.possible_directions[this.directionEnum.LEFT].value) {
                    next_positions.move_x.sprite_next_x -= tile_width; 
                    if (this.pman.direction_current == null)
                        this.pman.direction_current = this.directionEnum.LEFT;
                }
                 
                if (move_x == 'ArrowRight' && this.pman.possible_directions[this.directionEnum.RIGHT].value) {
                    next_positions.move_x.sprite_next_x += tile_width;
                    if (this.pman.direction_current == null)
                        this.pman.direction_current = this.directionEnum.RIGHT;
                }
                    
                // store tile change coordinates
                this.pman.change_coords_x = map.get_map_tile_position_pixel_coords(
                    next_positions.move_x.sprite_next_x,
                    next_positions.move_x.sprite_next_y);
            }

            if (move_y) {

                if (move_y == 'ArrowUp' && this.pman.possible_directions[this.directionEnum.UP].value) {
                    next_positions.move_y.sprite_next_y -= tile_height;
                    if (this.pman.direction_current == null)
                        this.pman.direction_current = this.directionEnum.UP;
                }
                    
                if (move_y == 'ArrowDown' && this.pman.possible_directions[this.directionEnum.DOWN].value) {
                    next_positions.move_y.sprite_next_y += tile_height;
                    if (this.pman.direction_current == null)
                        this.pman.direction_current = this.directionEnum.DOWN;
                }
                    
                this.pman.change_coords_y = map.get_map_tile_position_pixel_coords(
                    next_positions.move_y.sprite_next_x,
                    next_positions.move_y.sprite_next_y);

            }

            this.pman.last_map_tile = current_tile;
        }


        //-------------------------------------------------------------------------------------------------
        // Tunnel - move pman eith side of screen for the tunnel
        //-------------------------------------------------------------------------------------------------
        if (this.pman.tile_position_current.map_x >= 31 &&
            this.pman.tile_position_current.map_y == 14 &&
            this.pman.direction_current == this.directionEnum.RIGHT) {
            this.set_position(24, this.sprite.y_pos);            
        }

        if (this.pman.tile_position_current.map_x <= 0 &&
            this.pman.tile_position_current.map_y == 14 &&
            this.pman.direction_current == this.directionEnum.LEFT) {
            this.set_position(744, this.sprite.y_pos);
        }
        //-------------------------------------------------------------------------------------------------
    





        //-------------------------------------------------------------------------------------------------
        // CHANGE DIRECTION - This is only used when the normal direction of pacman is
        // changed in a straight line.  For example changing from going left to going right
        // or up to going down.  NOTE this will not go around corner such as going 
        // DOWN to RIGHT
        
        if (move_y == 'ArrowUp' && this.pman.direction_current == this.directionEnum.DOWN) {
            this.pman.direction_current = this.directionEnum.UP;            
            if (this.pman.possible_directions[this.directionEnum.UP].value)                       
                this.pman.change_coords_y = map.get_map_tile_position_pixel_coords(this.sprite.x_pos, this.sprite.y_pos - 24);
            else
                this.pman.change_coords_y = map.get_map_tile_position_pixel_coords(this.sprite.x_pos, this.sprite.y_pos);
        }

        if (move_x == 'ArrowRight' && this.pman.direction_current == this.directionEnum.LEFT) {
            this.pman.direction_current = this.directionEnum.RIGHT; 
            if (this.pman.possible_directions[this.directionEnum.RIGHT].value)                       
                this.pman.change_coords_x = map.get_map_tile_position_pixel_coords(this.sprite.x_pos + 24, this.sprite.y_pos);
            else                
                this.pman.change_coords_x = map.get_map_tile_position_pixel_coords(this.sprite.x_pos, this.sprite.y_pos);
        }

        if (move_y == 'ArrowDown' && this.pman.direction_current == this.directionEnum.UP) {
            this.pman.direction_current = this.directionEnum.DOWN;
            if (this.pman.possible_directions[this.directionEnum.DOWN].value)
                this.pman.change_coords_y = map.get_map_tile_position_pixel_coords(this.sprite.x_pos, this.sprite.y_pos + 24);
            else
                this.pman.change_coords_y = map.get_map_tile_position_pixel_coords(this.sprite.x_pos, this.sprite.y_pos);                
        }

        if (move_x == 'ArrowLeft' && this.pman.direction_current == this.directionEnum.RIGHT) {
            this.pman.direction_current = this.directionEnum.LEFT;
            if (this.pman.possible_directions[this.directionEnum.LEFT].value)
                this.pman.change_coords_x = map.get_map_tile_position_pixel_coords(this.sprite.x_pos - 24, this.sprite.y_pos);
            else                
                this.pman.change_coords_x = map.get_map_tile_position_pixel_coords(this.sprite.x_pos, this.sprite.y_pos);
        }
        
        //-------------------------------------------------------------------------------------------------


        //-------------------------------------------------------------------------------------------------
        // CHANGE DIRECTON - This is only used when changing direction around corners.  It will 
        // allow pman to go around the corner - cutting the corner is needed

        if (!this.pman.direction_changed)
        {
        // UP        
        if (
            (move_y == 'ArrowUp') &&                                            // Want to go up
            (this.pman.possible_directions[this.directionEnum.UP].value) &&     // possible to move in new direction
            (this.pman.direction_current != this.directionEnum.UP)              // Not moving UP                
        ) {           
            this.check_change_direction(map, this.pman.tile_position_current.center_x,
                this.pman.tile_position_current.center_y, this.directionEnum.UP);
        }

        // RIGHT
        else if (
            (move_x == 'ArrowRight') &&                                            // Want to go up
            (this.pman.possible_directions[this.directionEnum.RIGHT].value) &&     // possible to move in new direction
            (this.pman.direction_current != this.directionEnum.RIGHT)              // Not moving UP                
        ) {            
            this.check_change_direction(map, this.pman.tile_position_current.center_x,
                this.pman.tile_position_current.center_y, this.directionEnum.RIGHT);
        }

        // DOWN
        else if (
            (move_y == 'ArrowDown') &&                                            // Want to go up                
            (this.pman.possible_directions[this.directionEnum.DOWN].value) &&     // possible to move in new direction
            (this.pman.direction_current != this.directionEnum.DOWN)              // Not moving LEFT                
        ) {           
            this.check_change_direction(map, this.pman.tile_position_current.center_x,
                this.pman.tile_position_current.center_y, this.directionEnum.DOWN);
        }

        // LEFT
        else if (
            (move_x == 'ArrowLeft') &&                                            // Want to go up                
            (this.pman.possible_directions[this.directionEnum.LEFT].value) &&     // possible to move in new direction
            (this.pman.direction_current != this.directionEnum.LEFT)              // Not moving LEFT                
        ) {            
            this.check_change_direction(map, this.pman.tile_position_current.center_x,
                this.pman.tile_position_current.center_y, this.directionEnum.LEFT);
        }
        }        
        //-------------------------------------------------------------------------------------------------


        //-------------------------------------------------------------------------------------------------
        // Move the little man.  Here is the code that moves pman in a straight line.  Up or down
        // left or right.  NOTE no cornering here.

        // Move Up                
        if (
            (move_y == 'ArrowUp') &&
            (this.pman.direction_current == this.directionEnum.UP)
        ) {
            if (this.sprite.y_pos - this.pman.speed <= this.pman.change_coords_y.center_y) {
                // short move
                this.sprite.y_pos = this.pman.change_coords_y.center_y;                
            } else {
                // Normal move
                this.sprite.y_pos -= this.pman.speed;                
            }
            this.set_animation_sequence_current(this.directionEnum.UP);
        }

        // Move Right                
        if (
            (move_x == 'ArrowRight') &&
            (this.pman.direction_current == this.directionEnum.RIGHT)
        ) {
            if (this.sprite.x_pos + this.pman.speed >= this.pman.change_coords_x.center_x) {
                // short move
                this.sprite.x_pos = this.pman.change_coords_x.center_x;                
            } else {
                // Normal move
                this.sprite.x_pos += this.pman.speed;                
            }
            this.set_animation_sequence_current(this.directionEnum.RIGHT);
        }

        // Down
        if (
            (move_y == 'ArrowDown') &&
            (this.pman.direction_current == this.directionEnum.DOWN)
        ) {
            if (this.sprite.y_pos + this.pman.speed >= this.pman.change_coords_y.center_y) {
                // short move
                this.sprite.y_pos = this.pman.change_coords_y.center_y;                
            } else {
                // Normal move
                this.sprite.y_pos += this.pman.speed;                
            }
            this.set_animation_sequence_current(this.directionEnum.DOWN);
        }

        // Move Left                
        if (
            (move_x == 'ArrowLeft') &&
            (this.pman.direction_current == this.directionEnum.LEFT)
        ) {
            if (this.sprite.x_pos - this.pman.speed <= this.pman.change_coords_x.center_x) {
                // short move  
                this.sprite.x_pos = this.pman.change_coords_x.center_x;                
            } else {
                // Normal move                 
                this.sprite.x_pos -= this.pman.speed;                
            }
            
            this.set_animation_sequence_current(this.directionEnum.LEFT);
        }
        //-------------------------------------------------------------------------------------------------

    }   // end move



    //-------------------------------------------------------------------------------------------------
    // Ghost killed pman
    //-------------------------------------------------------------------------------------------------
    die_pman_die() {
        
        console.log('kill pman');
        this.sprite.status = this.statusEnum.DYING;
        this.set_animation_sequence_current(4);

    }


    check_change_direction(map, current_tile_x, current_tile_y, direction) {
       

        // OK we are approaching a turn - are we close enough?
        var turn_distance_x = this.sprite.x_pos - current_tile_x;
        var turn_distance_y = this.sprite.y_pos - current_tile_y;
        var changing_direction_x = false;
        var changing_direction_y = false;

        // Left
        if (turn_distance_x >= 0 && turn_distance_x <= this.pman.corner_pre_pixels) {
            this.sprite.x_pos -= turn_distance_x;            
            changing_direction_x = true;
        }

        // up
        if (turn_distance_y >= 0 && turn_distance_y <= this.pman.corner_pre_pixels) {
            this.sprite.y_pos -= turn_distance_y;
            changing_direction_y = true;
        }

        // right
        if (!changing_direction_x) {
            if (turn_distance_x < 0 && turn_distance_x >= this.pman.corner_post_pixels) {
                this.sprite.x_pos -= turn_distance_x;
                changing_direction_x = true;
            }
        }

        // down
        if (!changing_direction_y) {
            if (turn_distance_y < 0 && turn_distance_y >= this.pman.corner_post_pixels) {                
                this.sprite.y_pos -= turn_distance_y;                            
                changing_direction_y = true;
            }
        }

        if (changing_direction_x && changing_direction_y) {
            this.pman.direction_current = direction;

            var x_pos = this.sprite.x_pos;
            var y_pos = this.sprite.y_pos;

            if (direction == this.directionEnum.LEFT)
                x_pos -= 24;

            if (direction == this.directionEnum.RIGHT)
                x_pos += 24;

            if (direction == this.directionEnum.UP)
                y_pos -= 24;

            if (direction == this.directionEnum.DOWN)
                y_pos += 24;

            if (direction == this.directionEnum.LEFT || direction == this.directionEnum.RIGHT)
                this.pman.change_coords_x = map.get_map_tile_position_pixel_coords(x_pos, y_pos);
            else
                this.pman.change_coords_y = map.get_map_tile_position_pixel_coords(x_pos, y_pos);

            this.pman.direction_changed = true;                
        }
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
            { name: 'ArrowUP',       dEnum: this.directionEnum.UP,    value: 1  },
            { name: 'ArrowRight',    dEnum: this.directionEnum.RIGHT, value: 1  },
            { name: 'ArrowDown',     dEnum: this.directionEnum.DOWN,  value: 1  },
            { name: 'ArrowLeft',     dEnum: this.directionEnum.LEFT,  value: 1  }
        ];

        // Do any of the surrounding tiles prevent movement ?
        // Remove direction available to travel based on the map tile
        var map_tiles = new Array(' ', '.','p');
        var surrounding_tiles = map.get_map_surrounding_tiles_pixel_coords(sprite_xpos, sprite_ypos);            

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
    // get our current direction
    //-----------------------------------------------------------------------------
    get_direction() {
        return this.pman.direction_current;
    }

    //-----------------------------------------------------------------------------
    // Return the position of the sprite
    //-----------------------------------------------------------------------------
    get_position() {
        return {
            x_pos: this.sprite.x_pos,
            y_pos: this.sprite.y_pos,
            direction: this.pman.direction_current
        };
    }

    set_speed(speed) {
        this.pman.speed = speed;
    }

} // end class