import * as FCore from "../CoreVersionComp.js";

import { RideableUtils, cModuleName } from "../utils/RideableUtils.js";
import { cTokenForms } from "../utils/GeometricUtils.js";

const cModule = "Rideable";

const cDelimiter = ";";

const cRidingF = "RidingFlag"; //Flag for informations regarding if Token is Riding
const cFamiliarRidingF = "FamiliarRidingFlag"; //Flag for informations regarding if Token is Riding its Master as a Familiar
const cRidersF = "RidersFlag"; //Flag name for informations regarding Riders of Tokens
const caddRiderHeightF = "addRiderHeightFlag"; //Flag name for additional Riderheight set ONYL by a GM
const cMaxRiderF = "MaxRiderFlag"; //Flag name for the maximum amount of Riders on this Token
const cissetRideableF = "issetRideableFlag"; //Flag name for setting wether or not a token is Rideable
const cTokenFormF = "TokenFormFlag"; //described the (border) form of the token
const cInsideMovementF = "InsideMovementFlag"; //Flag that allows riders of this token to move freely within this token
const cRelativPositionF = "RelativPositionFlag"; //Flag that describes a relativ position for a given token
const cRiderPositioningF = "RiderPositioningFlag"; //Flag that describes how the riderr tokens should be place
const cSpawnRidersF = "SpawnRidersFlag"; //Flag that describes all riders that should spawn on creation (names or ids)
const cGrappledF = "GrappledFlag"; //Flag that describes, that this token is riding as a grabbled token
const cSizesaveFlag = "SizesaveFlag"; //Flag that can save the size of the token

//limits
const cCornermaxRiders = 4; //4 corners

export {cCornermaxRiders};
export {cRidingF, cFamiliarRidingF, cRidersF, caddRiderHeightF, cMaxRiderF, cissetRideableF, cTokenFormF, cInsideMovementF, cRiderPositioningF, cSpawnRidersF}

//handels all reading and writing of flags (other scripts should not touch Rideable Flags (other than possible RiderCompUtils for special compatibilityflags)
class RideableFlags {
	//DECLARATIONS
	
	//flag handling	
	//flag information
		//basic Rider Info
		static isRidden (pRiddenToken) {} //returns true if pRiddenToken has Rider Tokens in Flags
		
		static TokenissetRideable(pToken) {} //if token is set to Rideable
		
		static TokenisRideable(pToken) {} //returns if token is Rideable trough flags and through settings
		
		static isRiddenID (pRiddenTokenID, pScene = null) {} //returns true if pRiddenTokenID matches Token which has Rider Tokens in Flags
		
		static isRiddenbyID (pRiddenToken, pRiderID) {} //returns true if pRiderID is in pRiddenToken RidersFlag
		
		static isRiddenby (pRiddenToken, pRider) {} //returns true if id of pRider is in pRiddenToken RidersFlag
		
		static isRider (pRiderToken) {} //returns true if pRiderToken is has Riding flag true
		
		static isFamiliarRider (pRiderToken) {} //returns true if pRiderToken has Riding flag and Familiar Riding flag true
		
		static wasFamiliarRider (pRiderToken) {} //returns true if pRiderToken is has Riding flag
		
		static isGrappled (pRiderToken) {} //returns true if pRiderToken has Riding flag and Grappled flag true
		
		static isGrappledby (pRiderToken, pRiddenToken) {} //returns true if pRiderToken has Riding flag and Grappled flag true and Rides pRiddenToken
		
		static wasGrappled(pRiderToken) {} //returns true if pRiderToken is has Grappled flag
		
		static isRiderID (pRiderTokenID, pScene = null) {} //returns true if pRiderTokenID matches Token which has Riding flag true
		
		static isFamiliarRiderID (pRiderTokenID, pScene = null) {} //returns true if pRiderTokenID matches Token which has Riding flag and Familiar Riding flag true
		
		static isGrappledID(pRiderTokenID, pScene = null) {} //returns true if pRiderTokenID matches Token which has Riding flag and Grappled Riding flag true
		
		static RiderTokenIDs (pRiddenToken) {} //returns array of Ridder IDs that ride pRiddenToken (empty if it is not ridden)
		
		static RidingLoop(pRider, pRidden) {} //returns true if a riding loop would be created should pRider mount pRidden
		
		static RiddenToken(pRider) {} //returns the token pRider rides (if any)
		
		//additional infos
		static TokenForm(pToken) {} //gives back the set form (either circle or rectangle)
		
		static RiderscanMoveWithin(pRidden) {} //returns if Riders are able move freely within the constraints of pRidden
		
		static RiderPositioning(pToken) {} //returns how riders should be placed on this token
		
		static SpawnRiders(pToken) {} //returns all SpawnRider IDs/Names ofr the given token in an array
		
		static SpawnRidersstring(pToken) {} //returns all SpawnRider IDs/Names ofr the given token in a string
	
		//Rider count infos
		static RiderCount(pRidden) {} //returns the number of Riders
		
		static MaxRiders(pRidden) {} //returns the maximum amount of riders this pRidden can can take
		
		static TokenRidingSpaceleft(pToken, pRidingOptions = {}) {} //returns amount of riding places left in pToken
		
		static TokenhasRidingPlace(pToken, pRidingOptions = {}) {} //returns if pToken has Riding places left
		
		static RiderFamiliarCount(pRidden) {} //returns the number of Riders that are familiars
		
		static RiderGrappledCount(pRidden) {} //returns the number of "Riders" that are grappled
	
		//Riding height info
		static RiderHeight(pRider) {} //returns the addtional Riding height of pToken
		
	//flag setting
	static async addRiderTokens (pRiddenToken, pRiderTokens, pRidingOptions = {Familiar: false, Grappled: false}, pforceset = false) {} //adds the IDs of the pRiderTokens to the ridden Flag of pRiddenToken (!pforceset skips safety measure!)
	
	static async cleanRiderIDs (pRiddenToken) {} //removes all Rider IDs that are now longer valid
	
	static removeRiderTokens (pRiddenToken, pRiderTokens, pRemoveRiddenreference = true) {} //removes the IDs of the pRiderTokens from the ridden Flag of pRiddenToken
	
	static recheckRiding (pRiderTokens) {} //rechecks to see if Ridden Token still exists
	
	static async recheckRiders (pRiddenToken) {} //rechecks to see if riders of pRiddenToken still exist
	
	static stopRiding(pRidingTokens, pRemoveRiddenreference = true) {} //tries to remove pRidingToken from all Riders Flags
	
	static removeallRiding(pRiddenToken) {} //stops all Tokens riding pRiddenToken from riding pRiddenToken
	
	static setRiderHeight(pToken, pHeight) {} //sets the addtional Riding Height of pToken to pHeight ONLY BY GM!
	
	static async savecurrentSize(pToken) {} //saves the current size of pToken into the SizesaveFlag (and makes size changeable if necessary)
	
	static resetSize(pToken) {} //resets the size of pToken to the SizesaveFlag if a size is saved
	
	//relativ Position handling
	static HasrelativPosition(pToken) {} //if a relativ position has already been Set
	
	static RelativPosition(pToken) {} //the current relativ Position
	
	static setRelativPosition(pToken, pPosition) {} //sets a new relativ position
	//IMPLEMENTATIONS
	
	//flags handling support
	
	static #RideableFlags (pToken) {	
	//returns all Module Flags of pToken (if any) (can contain Riding and Riders Flags)
		if (pToken) {
			if (pToken.flags.hasOwnProperty(cModuleName)) {
				return pToken.flags.Rideable;
			}
		}
		
		return; //if anything fails
	} 
	
	static #RidingFlag (pToken) { 
	//returns content of Riding Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRidingF)) {
				return vFlag.RidingFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #FamiliarRidingFlag (pToken) { 
	//returns content of Familiar Riding Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cFamiliarRidingF)) {
				return vFlag.FamiliarRidingFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #RidersFlag (pToken) {
	//returns content of Riders Flag of pToken (if any) (array of id strings)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRidersF)) {
				return vFlag.RidersFlag;
			}
		}
		
		return []; //default if anything fails
	} 
	
	static #RidingHeightFlag (pToken) {
	//returns value of addRiderHeight Flag of pToken or 0
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(caddRiderHeightF)) {
				return vFlag.addRiderHeightFlag;
			}
		}
		
		return 0; //default if anything fails
	}
	
	static #MaxRiderFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cMaxRiderF) && (typeof vFlag.MaxRiderFlag == "number")) {
				return vFlag.MaxRiderFlag;
			}
		}
		
		return game.settings.get(cModuleName, "MaxRiders"); //default if anything fails
	}
	
	static #issetRideableFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cissetRideableF)) {
				return vFlag.issetRideableFlag;
			}
		}
		
		return game.settings.get(cModuleName, "defaultRideable"); //default if anything fails		
	}
	
	static #TokenFormFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cTokenFormF)) {
				return vFlag.TokenFormFlag;
			}
		}
		
		return cTokenForms[0]; //default if anything fails		
	}
	
	static #InsideMovementFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cInsideMovementF)) {
				return vFlag.InsideMovementFlag;
			}
		}
		
		return false; //default if anything fails		
	}
	
	static #RelativPositionFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRelativPositionF)) {
				return vFlag.RelativPositionFlag;
			}
		}
		
		return []; //default if anything fails			
	}
	
	static #RiderPositioningFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRiderPositioningF)) {
				return vFlag.RiderPositioningFlag;
			}
		}
		
		return ""; //default if anything fails			
	}
	
	static #SpawnRidersFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cSpawnRidersF)) {
				return vFlag.SpawnRidersFlag;
			}
		}
		
		return ""; //default if anything fails			
	}
	
	static #GrappledFlag (pToken) { 
	//returns content of Gappled Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cGrappledF)) {
				return vFlag.GrappledFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #SizesaveFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cSizesaveFlag)) {
				return vFlag.SizesaveFlag;
			}
		}
		
		return []; //default if anything fails			
	}
	
	static async #setRidingFlag (pToken, pContent) {
	//sets content of RiddenFlag (must be boolean)
		if (pToken) {
			await pToken.setFlag(cModule, cRidingF, Boolean(pContent));
			
			return true;
		}
		return false;
	} 
	
	static async #setFamiliarRidingFlag (pToken, pContent) {
	//sets content of FamiliarRiddenFlag (must be boolean)
		if (pToken) {
			await pToken.setFlag(cModule, cFamiliarRidingF, Boolean(pContent));
			
			return true;
		}
		return false;
	} 
	
	static async #setRidersFlag (pToken, pContent) {
	//sets content of addRiderHeight Flag (must number)
		if ((pToken) && (Array.isArray(pContent))) {
			await pToken.setFlag(cModule, cRidersF, pContent.filter(vID => vID != pToken.id));
			
			return true;
		}
		return false;
	}
	
	static #setaddRiderHeightFlag (pToken, pContent) {
	//sets content of RiddenFlag (must be array of strings)
		if ((pToken) && (typeof pContent === "number")) {
			pToken.setFlag(cModule, caddRiderHeightF, pContent);
			
			return true;
		}
		return false;
	}
	
	static #setRelativPositionFlag (pToken, pContent) {
	//sets content of RelativPosition (must be array of two numbers)
		if ((pToken) && ((pContent.length == 2) || (pContent.length == 0))) {
			pToken.setFlag(cModule, cRelativPositionF, pContent);
			
			return true;
		}
		return false;		
	}
	
	static async #setGrappledFlag(pToken, pContent) {
	//sets content of GrappledFlag (must be boolean)
		if (pToken) {
			await pToken.setFlag(cModule, cGrappledF, Boolean(pContent));
			
			return true;
		}
		return false;
	}
	
	static #setSizesaveFlag(pToken, pContent) {
		if ((pToken) && ((pContent.length == 2) || (pContent.length == 0))) {
			pToken.setFlag(cModule, cSizesaveFlag, pContent);
			
			return true;
		}
		return false;
	}
	
	static #resetFlags (pToken) {
	//removes all Flags
		if (pToken) {
			pToken.unsetFlag(cModule, cRidingF);
			pToken.unsetFlag(cModule, cFamiliarRidingF);
			pToken.unsetFlag(cModule, cRidersF);
			pToken.unsetFlag(cModule, caddRiderHeight);
			pToken.unsetFlag(cModule, cMaxRiderF);
			pToken.unsetFlag(cModule, cissetRideableF);
			
			return true;
		}
		return false;
	} 
	
	//flag handling	
	//flag information
	static isRidden (pRiddenToken) {	
		return (this.#RidersFlag(pRiddenToken).length > 0);
	}
	
	static TokenissetRideable(pToken) {
		return this.#issetRideableFlag(pToken);
	}
	
	static TokenisRideable (pToken) {
		return (RideableFlags.TokenissetRideable(pToken) || RideableUtils.TokenissettingRideable(pToken));
	}
	
	static isRiddenID (pRiddenTokenID, pScene = null) {
		let vToken = RideableUtils.TokenfromID(pRiddenTokenID, pScene);
		
		if (vToken) {
			return RideableFlags.isRidden(vToken);
		}
		
		return false;
	}
	
	static isRiddenbyID (pRiddenToken, pRiderID) {
		return this.#RidersFlag(pRiddenToken).includes(pRiderID);
	}
	
	static isRiddenby (pRiddenToken, pRider) {
		if (pRider) {
			return this.isRiddenbyID(pRiddenToken, pRider.id)
		}
		
		return false;
	} 
	
	static isRider (pRiderToken) {	
		return this.#RidingFlag(pRiderToken);
	}
	
	static isFamiliarRider (pRiderToken) {
		return (this.isRider(pRiderToken) && this.#FamiliarRidingFlag(pRiderToken));
	}
	
	static wasFamiliarRider (pRiderToken) {
		return this.#FamiliarRidingFlag(pRiderToken);
	}
	
	static isGrappled (pRiderToken) {
		return (this.isRider(pRiderToken) && this.#GrappledFlag(pRiderToken));
	}
	
	static isGrappledby (pRiderToken, pRiddenToken) {
		return this.isGrappled(pRiderToken) && this.isRiddenby(pRiddenToken, pRiderToken);
	} 
	
	static wasGrappled(pRiderToken) {
		return this.#GrappledFlag(pRiderToken);
	}
	
	static isRiderID (pRiderTokenID, pScene = null) {
		let vToken = RideableUtils.TokenfromID(pRiderTokenID, pScene);
		
		if (vToken) {
			return this.isRider(vToken);
		}
		
		return false;
	}
	
	static isFamiliarRiderID (pRiderTokenID, pScene = null) {
		let vToken = RideableUtils.TokenfromID(pRiderTokenID, pScene);
		
		if (vToken) {
			return this.isFamiliarRider(vToken);
		}
		
		return false;
	} 
	
	static isGrappledID(pRiderTokenID, pScene = null) {
		let vToken = RideableUtils.TokenfromID(pRiderTokenID, pScene);
		
		if (vToken) {
			return this.isGrappled(vToken);
		}
		
		return false;		
	}
	
	static RiderTokenIDs (pRiddenToken) {
		return this.#RidersFlag(pRiddenToken);
	}
	
	static RidingLoop(pRider, pRidden) {
		if (!RideableFlags.isRiddenby(pRider, pRidden)) {
			//continue if pRider is not ridden by pRidden
			var vRidingLoop = false;
			
			let i = 0;
			while ((i < RideableFlags.RiderTokenIDs(pRider).length) && (!vRidingLoop)) {
				//with recursion, check all Riders of pRider for RidingLoop with pRidden
				vRidingLoop = RideableFlags.RidingLoop(RideableUtils.TokenfromID(RideableFlags.RiderTokenIDs(pRider)[i], FCore.sceneof(pRider)), pRidden);
			
				i++;
			}
			
			return vRidingLoop;
		}
		
		return true;
	}
	
	static RiddenToken(pRider) {
		return FCore.sceneof(pRider).tokens.find(vToken => RideableFlags.isRiddenby(vToken, pRider));
	}
	
	//additional infos
	static TokenForm(pToken) {
		return this.#TokenFormFlag(pToken);
	}
	
	static RiderscanMoveWithin(pRidden) {
		return(this.#InsideMovementFlag(pRidden));
	}
	
	static RiderPositioning(pToken) {
		return this.#RiderPositioningFlag(pToken);
	}
	
	static SpawnRiders(pToken) {
		return this.#SpawnRidersFlag(pToken).split(cDelimiter);
	}
	
	static SpawnRidersstring(pToken) {
		return this.#SpawnRidersFlag(pToken);
	}
	
	//Rider count infos
	static RiderCount(pRidden) {
		return this.#RidersFlag(pRidden).filter(vID => !RideableFlags.isFamiliarRider(RideableUtils.TokenfromID(vID , FCore.sceneof(pRidden)))).length;
	}
	
	static MaxRiders(pRidden) {
		if (RideableFlags.#MaxRiderFlag(pRidden) >= 0) {
			return RideableFlags.#MaxRiderFlag(pRidden);
		}
		else {
			return Infinity;
		}
	}
	
	static TokenRidingSpaceleft(pToken, pRidingOptions = {}) {
		if (pRidingOptions.Familiar) {
			return (cCornermaxRiders - RideableFlags.RiderFamiliarCount(pToken));
		}
		
		if (pRidingOptions.Grappled) {
			return Infinity; //change for max grappling
		}
		
		return (RideableFlags.MaxRiders(pToken) - RideableFlags.RiderCount(pToken));
	} 
	
	static TokenhasRidingPlace(pToken, pRidingOptions = {}) {
		return (RideableFlags.TokenRidingSpaceleft(pToken, pRidingOptions) > 0);
	}
	
	static RiderFamiliarCount(pRidden) {
		return this.#RidersFlag(pRidden).filter(vID => RideableFlags.isFamiliarRider(RideableUtils.TokenfromID(vID, FCore.sceneof(pRidden)))).length;
	} 
	
	static RiderGrappledCount(pRidden) {
		return this.#RidersFlag(pRidden).filter(vID => RideableFlags.isGrappled(RideableUtils.TokenfromID(vID, FCore.sceneof(pRidden)))).length;
	}
	
	static RiderHeight(pRider) {
		return this.#RidingHeightFlag(pRider);
	}
	
	//flag setting
	static async addRiderTokens (pRiddenToken, pRiderTokens, pRidingOptions = {Familiar: false, Grappled: false}, pforceset = false) {
		if (pRiddenToken) {
			let vValidTokens = pRiderTokens.filter(vToken => (!this.isRider(vToken) || pforceset) && (vToken != pRiddenToken)); //only Tokens which currently are not Rider can Ride and Tokens can not ride them selfs
			
			if (await this.#setRidersFlag(pRiddenToken, this.#RidersFlag(pRiddenToken).concat(RideableUtils.IDsfromTokens(vValidTokens)))) {
				for (let i = 0; i < vValidTokens.length; i++) {
					if (vValidTokens[i]) {
						await this.#setRidingFlag(vValidTokens[i],true);
						await this.#setFamiliarRidingFlag(vValidTokens[i],pRidingOptions.Familiar);
						await this.#setGrappledFlag(vValidTokens[i],pRidingOptions.Grappled);
					}
				}				
			}
		}
	}
	
	static async cleanRiderIDs (pRiddenToken) {
		//will only keep ids for which a token exists that has the Rider flag
		await this.#setRidersFlag(pRiddenToken, this.#RidersFlag(pRiddenToken).filter(vID => RideableFlags.isRider(RideableUtils.TokenfromID(vID, FCore.sceneof(pRiddenToken)))));
	} 
	
	static removeRiderTokens (pRiddenToken, pRiderTokens, pRemoveRiddenreference = true) {
		if (pRiddenToken) {
			let vValidTokens = pRiderTokens.filter(vToken => this.isRiddenby(pRiddenToken, vToken)); //only Tokens riding pRiddenToken can be removed
			
			if (pRemoveRiddenreference) {
				let vnewRiderIDs = this.#RidersFlag(pRiddenToken).filter(vID => !(RideableUtils.IDsfromTokens(vValidTokens).includes(vID)));
				
				this.#setRidersFlag(pRiddenToken, vnewRiderIDs);
			}
			
			for (let i = 0; i < pRiderTokens.length; i++) {
				this.#setRidingFlag(pRiderTokens[i], false);
				
				if (pRemoveRiddenreference) {
					this.#setRelativPositionFlag(pRiderTokens[i], []);
				}
				
				//this.#setFamiliarRidingFlag(pRiderTokens[i], false);
				this.#setaddRiderHeightFlag(pRiderTokens[i], 0);
			}
		}
	}
	
	static recheckRiding (pRiderTokens) {
		if (pRiderTokens) {
			for (let i = 0; i < pRiderTokens.length; i++) {
				this.#setRidingFlag(pRiderTokens[i], Boolean(FCore.sceneof(pRiderTokens[i]).tokens.find(vTokens => this.isRiddenby(vTokens, pRiderTokens[i]))));
			}
		}
	}
	
	static async recheckRiders (pRiddenToken) {
		await this.#setRidersFlag(pRiddenToken, this.#RidersFlag(pRiddenToken).filter(vID => FCore.sceneof(pRiddenToken).tokens.get(vID)));
	} 
	
	static stopRiding (pRidingTokens, pRemoveRiddenreference = true) {
		if (pRidingTokens) {
			for (let i = 0; i < pRidingTokens.length; i++) {
				if (pRidingTokens[i]) {
					let vRidingToken = pRidingTokens[i];
					
					let vRiddenTokens = FCore.sceneof(pRidingTokens[i]).tokens.filter(vToken => this.isRiddenby(vToken, vRidingToken));
					
					if (vRiddenTokens.length) {
						for (let j = 0; j < vRiddenTokens.length; j++) {
							this.removeRiderTokens(vRiddenTokens[j], pRidingTokens, pRemoveRiddenreference);
						}
					}
					else {
						this.#setRidingFlag(vRidingToken, false);
						
						if (pRemoveRiddenreference) {
							this.#setRelativPositionFlag(vRidingToken, []);
						}
						//this.#setFamiliarRidingFlag(vRidingToken, false);
					}
				}
			}
		}
		
		//this.recheckRiding(pRidingTokens);
	}
	
	static removeallRiding (pRiddenToken) {
		if (pRiddenToken) {
			this.removeRiderTokens(pRiddenToken, RideableUtils.TokensfromID(RiderTokenIDs(pRiddenToken)));
			
			this.#setRidersFlag(pRiddenToken, []);
		}
		
		return this.isRidden(pRiddenToken);
	}
	
	static setRiderHeight(pToken, pHeight) {
		if (game.user.isGM) {
			if (pToken) {
				this.#setaddRiderHeightFlag(pToken, pHeight);
			}
		}
	}

	static async savecurrentSize(pToken) {
		await this.#setSizesaveFlag(pToken, [pToken.width, pToken.height]);
		
		if (RideableUtils.isPf2e()) {
			await pToken.update({flags : {pf2e : {linkToActorSize : false}}})
		}
	}
	
	static resetSize(pToken) {
		if (this.#SizesaveFlag(pToken).length) {
			let vsavedSize = this.#SizesaveFlag(pToken);
			
			this.#setSizesaveFlag(pToken, []);
			
			pToken.update({width: vsavedSize[0], height: vsavedSize[1]});
			
			if (RideableUtils.isPf2e()) {
				pToken.update({flags : {pf2e : {linkToActorSize : true}}})
			}
		}
	}
	
	//relativ Position handling
	static HasrelativPosition(pToken) {
		return (this.#RelativPositionFlag(pToken).length == 2);
	} 
	
	static RelativPosition(pToken) {
		if (RideableFlags.HasrelativPosition(pToken)) {
			return this.#RelativPositionFlag(pToken);
		}
		else {
			return [0,0];
		}
	}
	
	static setRelativPosition(pToken, pPosition) {
		if (pPosition.length == 2) {
			this.#setRelativPositionFlag(pToken, pPosition);
		}
	} 
}

//Export RideableFlags Class
export{ RideableFlags };
