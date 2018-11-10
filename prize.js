class prize extends game_sprite {
    constructor() {
        super();

        this.data = {
            pos_x: 384,
            pos_y: 396,                        
            enable_draw: false,
            count:0,
            count_end: 300,
            sprite:0
        };

    }



    check_eat_pie(map, pman_x, pman_y) {

        if (this.data.enable_draw == false)
            return false;

            
        var pie_tile = map.get_map_tile_number_pixel_coords(this.data.pos_x, this.data.pos_y);           
        var pman_tile = map.get_map_tile_number_pixel_coords(pman_x, pman_y);           

        if (pie_tile == pman_tile)
        {

            // we've eaten pie stop showing
            this.data.enable_draw = false;

            // yay we ate pie - or something
            return this.data.sprite + 1;
        }

        
        return false;

    }


    // Draw the santa    
    draw(context) {

        if (this.data.enable_draw == false)
            return;

        super.draw(context);
        

        this.data.count ++;
        if (this.data.count >= this.data.count_end)
            this.data.enable_draw = false;

    }


    //----------------------------------------------------------------------------
    // Trigger the santa run
    //----------------------------------------------------------------------------
    trigger_run() {


        if (this.data.enable_draw)
            return;

        // timer            
        this.data.count = 0;            


        this.data.sprite = Math.floor((Math.random() * 3) + 0);
        this.set_animation_sequence_current(this.data.sprite);


        this.sprite.x_pos = this.data.pos_x;
        this.sprite.y_pos = this.data.pos_y;
        this.data.enable_draw = true;
    }







}