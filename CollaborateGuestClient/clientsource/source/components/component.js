enyo.kind({
	name: "kind.cgc.com.broadsoft.Drawer",
	kind:  "FittableRows",
    fit:true,
    open:false,
    style:" height:30px; overflow:hidden;",
    
	components:[
      { layoutKind : "FittableColumnsLayout",
		name: "drawerHeader",
        fit:true,
        classes: "bsftDrawerHeader",
		components:[{
			name:"title",
            kind: "enyo.FittableRows",
            classes: "bsftDrawerTitleCloseOuterBox",
            components:[
             {
            	 tag:"div", 
            	 classes : "bsftDrawerTitleClose", 
            	 name:"titleText", 
            	 id:"titleText",
            	 allowHtml:true, 
            	 content:""
             }],
            ontap:"openCloseDrawer"
		  },{
				name:"drawerKnob",
				tag : "enyo.FittableRows",
                classes : "bsftDrawerKnobCloseOuterBox",
				ontap : "openCloseDrawer",
                components:[{
                     tag : "img",
                     name : "arrowofdialInfo",
                     classes: "bsftDrawerKnobClose",
				     src : "branding/assets/right-arrow.svg"
                   }
                ]
		  }
		]
      },{
         kind: "enyo.FittableRows",
         name: "contentPane",
         classes: "bsftContentPane",
         components:[
           {
		      kind: "enyo.FittableRows",
		      name: "items",
              classes: "bsftContentPaneItems",
		      components:[  ],
              addItem: function(comp){
                   
                      if(comp){
                        this.createComponent(comp);
        
                          if (this.hasNode()) {
                              this.render();
                          }
                      }    
              } 
           }
         ]            

      }
   ],
   
   openCloseDrawer: function(){
	   
         if(this.open){
        	 
             this.applyStyle("height","30px");
             this.$.arrowofdialInfo.setSrc("branding/assets/right-arrow.svg");
            // this.$.titleText.applyStyle("border-bottom","");
             this.$.titleText.removeClass('bsftDrawerTitleActive');
             
             this.$.titleText.removeClass('bsftDrawerTitleOpen');
             this.$.titleText.addClass('bsftDrawerTitleClose');
             
         }else{
        	 
        	 this.$.arrowofdialInfo.setSrc("branding/assets/down-arrow.svg");
        	 this.applyStyle("height","");
        	 if(cgcCallMeNumberText == '') {
        		 this.$.titleText.removeClass('bsftDrawerTitleActive');
        	 } else {
        		 this.$.titleText.addClass('bsftDrawerTitleActive');
        	 }
        	 
//             this.$.titleText.applyStyle("border-bottom","1px solid #3fc8AA");
        	 this.$.titleText.removeClass('bsftDrawerTitleClose');
             this.$.titleText.addClass('bsftDrawerTitleOpen');
             
         }
         enyo.Signals.send("layoutRefresh");
         this.open = !this.open;
        
	},
    addElement: function(comp){
      // created but not rendered
      this.$.items.addItem(comp);
      
    },
    setTitle: function(titleTxt){
    	this.$.titleText.setContent(titleTxt);
    },
    hideHeaderBar:function(){
    	this.$.drawerHeader.hide();
    	this.open = false;
    	this.openCloseDrawer();
    },
    showHeaderBar:function(){
    	this.$.drawerHeader.show();
    	this.open = true;
    	this.openCloseDrawer();
    },
    getComponentCount:function(){
    	return componentCount;
    },
    setActive:function(isActive){
    	if(isActive){
    		this.$.titleText.addClass('bsftDrawerTitleActive');
    	}else{
    		this.$.titleText.removeClass('bsftDrawerTitleActive');
    	}
    }
})



enyo.kind({
	name: "kind.cgc.com.broadsoft.DesktopShareDrawer",
	kind:  "FittableRows",
    fit:true,
    desktopShareOpen:false,
    expandable:true,
    style:" height:30px; overflow:hidden;",
    classes: "bsftDesktopShareDrawer",
    
	components:[
      { layoutKind : "FittableColumnsLayout",
		name: "desktopShareDrawerHeader",
        fit:true,
        classes: "bsftDrawerHeader",
		components:[{
			name:"shareTitle",
            kind: "enyo.FittableRows",
            classes: "bsftDrawerTitleCloseOuterBox",
            components:[
             {
            	 tag:"div", 
            	 classes : "bsftDrawerTitleClose", 
            	 name:"desktopShareTitleText", 
            	 id:"desktopShareTitleText",
            	 allowHtml:true, 
            	 content:""
             }],
            ontap:"openCloseDesktopShareDrawer"
		  },{
				name:"desktopShareDrawerKnob",
				tag : "enyo.FittableRows",
                classes : "bsftDrawerKnobCloseOuterBox",
				ontap : "openCloseDesktopShareDrawer",
                components:[{
                     tag : "img",
                     name : "arrowofDesktopShare",
                     classes: "bsftDrawerKnobClose",
				     src : "branding/assets/right-arrow.svg"
                   }
                ]
		  }
		]
      },{
         kind: "enyo.FittableRows",
         name: "desktopShareContentPane",
         classes: "bsftContentPane",
         components:[
           {
		      kind: "enyo.FittableRows",
		      name: "desktopShareItems",
              classes: "bsftContentPaneItems",
		      components:[  ],
              addItem: function(comp){
                   
                      if(comp){
                        this.createComponent(comp);
        
                          if (this.hasNode()) {
                              this.render();
                          }
                      }    
              } 
           }
         ]            

      }
   ],
   rendered: function() {
	   	this.$.arrowofDesktopShare.setSrc("branding/assets/down-arrow.svg");
  	 	this.applyStyle("height","");
	   
   }

	,
   
   openCloseDesktopShareDrawer: function(sender, event){
	   
	   if(!this.expandable) {
		   return;
	   }
	   
	   if(this.desktopShareOpen){
	 
		 // If the drawer is open, then close it
		 this.$.arrowofDesktopShare.setSrc("branding/assets/right-arrow.svg");
		 this.$.desktopShareContentPane.hide();
		 this.desktopShareOpen = !this.desktopShareOpen;
     
	   } else {
	 
		  // If the drawer is closed, then open it
		  this.$.arrowofDesktopShare.setSrc("branding/assets/down-arrow.svg");
		  this.$.desktopShareContentPane.show();
		  this.desktopShareOpen = !this.desktopShareOpen;
     
	   }
	   enyo.Signals.send("layoutRefresh");
        
	},
    addElement: function(comp){
      // created but not rendered
      this.$.desktopShareItems.addItem(comp);
      
    },
    disableDesktopSharePanel:function(){
    	this.expandable = false;
    	this.desktopShareOpen = false;
    	this.$.desktopShareContentPane.hide();
    	this.$.arrowofDesktopShare.hide();
    },
    enableDesktopSharePanel:function(){
    	this.expandable = true;
    	this.desktopShareOpen = true;
    	this.$.desktopShareContentPane.show();
    	this.$.arrowofDesktopShare.show();
    	this.$.arrowofDesktopShare.setSrc("branding/assets/down-arrow.svg");
    },
    setTitle: function(titleTxt){
    	this.$.desktopShareTitleText.setContent(titleTxt);
    },
    hideDesktopSharePanel:function(){
    	this.$.desktopShareDrawerHeader.hide();
    	// this.$.disableDesktopSharePanel();
    	this.expandable = false;
    	this.desktopShareOpen = false;
    	this.$.desktopShareContentPane.hide();
    	this.$.arrowofDesktopShare.hide();
    },
    showDesktopSharePanel:function(){
    	this.$.desktopShareDrawerHeader.show();
    	this.enableDesktopSharePanel();
    }
})