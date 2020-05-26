var gameMain = function(game){
	notCreated = true;
	
    blues = [
    	'C1','Eb1','F1','F#1','G1','Bb1', 
    	'C2','Eb2','F2','F#2','G2','Bb2', 
    	'C3','Eb3','F3','F#3','G3','Bb3',
   		'C4','Eb4','F4','F#4','G4','Bb4', 
    	'C5','Eb5','F5','F#5','G5','Bb5',
    	'C6','Eb6','F6','F#6','G6','Bb6'
    ];
    
    letters = '0123456789ABCDEF'.split('');
    color = null;
};

gameMain.prototype = {
    create: function(){ 
    	bg = game.add.image(480, 360, 'bg');
    	bg.alpha = 0.8;
    	bg.anchor.set(0.5, 0.5);
        
        duration = 0;
        wave = null;
        osces = [];

		tween = game.add.tween(bg).to( { alpha: 0.25 }, 8000, "Cubic", true, 0, -1);
    	tween.yoyo(true, 0);
        
        theripple = game.add.graphics(-500, -500);

        theripple.lineStyle(4, 0xffffff, 1);
        theripple.drawCircle(300, 300, 75);
        theripple.boundsPadding = 0;
    
        rippleTexture = theripple.generateTexture();
        
        shapeSprites = [];
        
        initAd();

        setTimeout(function(){
	        try{
	            window.plugins.insomnia.keepAwake();
	        } catch(e){}
        	try{
                StatusBar.hide;
            } catch(e){}
        }, 1000); 

        setTimeout(function(){
        	game.add.tween(bg.scale).to({x: 0, y: 0}, 3000, "Cubic", true); 
		    game.add.tween(bg).to({angle: 180}, 3000, "Cubic", true).onComplete.add(function(){   
		        this.game.state.start("Game");
		    },this);
        }, 60000);
    },
    
    update: function(){ 
        if (game.input.activePointer.isDown){
            duration = game.input.activePointer.duration;

            yAxis = game.input.activePointer.y;
            xAxis = game.input.activePointer.x;
            
            drawRipple(xAxis, yAxis);
			
			if (notCreated){
				notCreated = false;
				createOsc(yAxis, xAxis);	
			}
			
			var place = Math.round(duration / 50);
			
			if (place > blues.length - 1){
				place = blues.length - 1;
			}
			
			if (yAxis <= 360){
				frequency = teoria.note(blues[place]).fq();
			}
			else{
				frequency = teoria.note(blues[blues.length - 1 - place]).fq();
			}
			
			if (osces.length - 1 >= 0){
				osces[osces.length - 1].set({freq: frequency});
			}
        }
        
        else if (game.input.activePointer.isUp){
        	if (!notCreated){
				notCreated = true;
        	}
        }   
    }
};

function createOsc(_yAxis, _xAxis){
	waves = ['tri', 'tri', 'sin', 'sin', 'saw'];
	wave = waves[game.rnd.integerInRange(0, 4)];
	
	var vol = 0.6;
	var vibrato = 8 - _yAxis / 100;
	var reverb = 0.1 + _xAxis / 1000;
	var release = 100 + (_yAxis + _xAxis) * 4.5;

	if (wave == 'saw') vol = 0.4;
	else if (wave == 'sin') vol = 0.9;

    osc = T("cosc", {wave: wave, beats: vibrato, mul: vol});
    osces.push(osc);
    
    rev = T("reverb", {room:0.9, damp:0.4, mix: reverb}, osces[osces.length - 1]);
    
    setTimeout(function(){
    	osces.splice(0,1);

	    osc.pause();
	    rev.pause();
	    osc.remove();
	    rev.remove();

    }, 9100 + release);

    T("perc", {a: 100, d:3500, s:5500, r: release}, rev).on("ended", function() {
        this.pause();
        this.remove();
    }).bang().play();	
}

function drawRipple(_xAxis, _yAxis){
    ripple = game.add.sprite(_xAxis, _yAxis, rippleTexture);
    ripple.anchor.setTo(0.5);

    shapeSprite = game.add.sprite(0, 0);   
	game.physics.enable(shapeSprite, Phaser.Physics.ARCADE);
	shapeSprites.push(shapeSprite);      
    shapeSprites[shapeSprites.length - 1].addChild(ripple);
    
	if (_yAxis <= 360){
		 shapeSprites[shapeSprites.length-1].body.gravity.y = duration / 12;
		 shapeSprite.body.collideWorldBounds = true;
		 shapeSprite.body.bounce.set(0.8);
	}
	else{
		 shapeSprites[shapeSprites.length-1].body.gravity.y = -(duration / 12);
	}
 
    if (wave == 'saw'){
    	ripple.tint = GetRandomColor('00');
    	shapeSprites[shapeSprites.length-1].body.gravity.x = osces.length / 2;
    }
    else if(wave == 'tri'){
    	ripple.tint = GetRandomColor('bb');
    	shapeSprites[shapeSprites.length-1].body.gravity.x = -osces.length / 2;
    }
    else if(wave == 'sin'){
    	ripple.tint = GetRandomColor('ff');
    }

    game.add.tween(ripple.scale).to({x: duration / 500, y: duration / 500}, Math.cos(duration) * 16000, "Cubic", true);
    game.add.tween(ripple).to({alpha: 0}, Math.cos(duration) * 16000, "Cubic", true).onComplete.add(function(ripple){   
        ripple.destroy();  
    },this);
}

function AddDigitToColor(limit){
    color += letters[Math.round(Math.random() * limit)];
}

function GetRandomColor(_color) {
    color = '0x' + _color;
    AddDigitToColor(4);
    
    for (var i = 0; i < 4; i++) {
        AddDigitToColor(15);
    }
    return color;
}

function initAd(){
    var admobid = {};

    admobid = {
        banner: 'ca-app-pub-9795366520625065/4874058244'
    };

    if(AdMob) AdMob.createBanner({
       adId: admobid.banner,
       position: AdMob.AD_POSITION.BOTTOM_CENTER,
       autoShow: true
    });
}