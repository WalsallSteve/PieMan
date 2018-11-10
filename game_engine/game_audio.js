class game_audio {
    constructor() {

        this.data = {
            context: false,     // audio context
            bank:[{              // audio bank
                source:false,
                isPlaying:false,
                audio_buffer:[]
            }]                         
        };
    }



    initialise() {
        this.data.context = new window.AudioContext();        
    }



    is_playing(bank) {
        return this.data.bank[bank].isPlaying;
    }



    set_trigger_on_end(self, bank, myfunction) {
        this.data.bank[bank].trigger_on_end_self = self;
        this.data.bank[bank].trigger_on_end = myfunction;
    }


    //-----------------------------------------------------------------------------
    // Play the audio
    //-----------------------------------------------------------------------------
    play(bank, loop) {

        
        // Only allow sample to play one at a time.
        if (this.data.bank[bank].isPlaying)
            return;

        var self = this;
        this.data.bank[bank].source = this.data.context.createBufferSource();
        this.data.bank[bank].source.buffer = this.data.bank[bank].audio_buffer;
        this.data.bank[bank].source.connect(this.data.context.destination);
        this.data.bank[bank].source.onended = onEnded;
        function onEnded() {
            self.data.bank[bank].isPlaying = false;

            if (self.data.bank[bank].trigger_on_end != undefined && 
                typeof self.data.bank[bank].trigger_on_end == 'function')
                self.data.bank[bank].trigger_on_end(self.data.bank[bank].trigger_on_end_self);
        }

        if (loop)
            this.data.bank[bank].source.loop = true;
        
        this.data.bank[bank].isPlaying = true;        
        this.data.bank[bank].source.start(0);
    }

    stop(bank) {


        if (this.data.bank[bank] && this.data.bank[bank].source) {
            this.data.bank[bank].source.stop();
        }
        

        /*
        var isFinished = false;
        var source = context.createBufferSource();
        source.onended = onEnded;
        function onEnded() {
            isFinished = true;
            console.log('playback finished');
        }
        */
    }


    //-----------------------------------------------------------------------------
    // Load the audio sample
    //-----------------------------------------------------------------------------
    load_audio(path, bank) {

        var self = this;        
        var promise = new Promise(function(resolve, reject) {

            var rawFile = new XMLHttpRequest();                   
            rawFile.onreadystatechange = function () {

                if (rawFile.readyState === 4) {               
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        //var allText = rawFile.responseText;
                        
                        //var data = rawFile.response;
                        self.data.context.decodeAudioData(rawFile.response, function(buffer) {
                            //self.data.audio_buffers[bank] = buffer;                            
                            
                            self.data.bank[bank] = {
                                source: false,
                                isPlaying: false,
                                audio_buffer: buffer
                            };
                            
                            resolve(); 
                        },function(error){
                            reject();
                        });                        
                    }
                    else {                        
                        reject('Failed to load file');
                    }            
                }            
            }
            
            rawFile.open("GET", path, true);
            rawFile.responseType = 'arraybuffer';
            rawFile.send();
        });

        return promise;
    }

}

    
    