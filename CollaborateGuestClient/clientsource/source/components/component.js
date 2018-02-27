
enyo.kind({
	name: "kind.cgc.com.broadsoft.Drawer",
	kind:  "FittableRows",
    fit:true,
    desktopShareOpen:true,
    expandable:true,
    style:" height:30px; overflow:hidden;",
    classes: "bsftDesktopShareDrawer",
    
	components:[
      { layoutKind : "FittableColumnsLayout",
		name: "desktopShareDrawerHeader",
        fit:true,
        classes: "bsftDrawerHeader bsftPrimarySeparator",
		components:[{
			name:"shareTitle",
            kind: "enyo.FittableRows",
            classes: "bsftDrawerTitleCloseOuterBox",
            components:[
             {
            	 tag:"div", 
            	 classes : "bsftDrawerTitleClose bsftHeaders bsftMediumFont", 
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
				     src : "branding/assets/up-arrow.png?ts=" + window.ts
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
		      name: "items",
//              classes: "bsftContentPaneItems",
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
	   	this.inherited(arguments);
  	 	this.applyStyle("height","");
   }

	,
   
   openCloseDesktopShareDrawer: function(sender, event){
	   
	   if(!this.expandable) {
		   return;
	   }
	   
	   if(this.desktopShareOpen){
		 // If the drawer is open, then close it
		 this.$.arrowofDesktopShare.setSrc("branding/assets/down-arrow.png?ts=" + window.ts);
		 this.$.desktopShareContentPane.hide();
	   } else {
		  // If the drawer is closed, then open it
		  this.$.arrowofDesktopShare.setSrc("branding/assets/up-arrow.png?ts=" + window.ts);
		  this.$.desktopShareContentPane.show();
	   }
	   this.desktopShareOpen = !this.desktopShareOpen;
	   enyo.Signals.send("layoutRefresh");
        
	},
	closeDrawer: function(){
		if(this.desktopShareOpen){
			this.openCloseDesktopShareDrawer(undefined, undefined);
		}
	},
    addElement: function(comp){
      // created but not rendered
      this.$.items.addItem(comp);
      
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
    	this.$.arrowofDesktopShare.setSrc("branding/assets/up-arrow.png?ts=" + window.ts);
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