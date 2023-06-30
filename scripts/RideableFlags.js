import { RideableUtils } from "./RideableUtils.js";

const cModule = "Rideable";

const cRidingF = "RidingFlag"; //Flag for informations regarding if Token is Riding
const cRidersF = "RidersFlag"; //Flag name for informations regarding Riders of Tokens

//handels all reading and writing of flags (other scripts should not touch Rideable Flags)
class RideableFlags {
	//DECLARATIONS
	
	//flag handling	
	//flag information
	static isRidden (pRiddenToken) {} //returns true if pRiddenToken has Rider Tokens in Flags
	
	static isRiddenID (pRiddenTokenID) {} //returns true if pRiddenTokenID matches Token which has Rider Tokens in Flags
	
	static isRiddenbyID (pRiddenToken, pRiderID) {} //returns true if pRiderID is in pRiddenToken RidersFlag
	
	static isRiddenby (pRiddenToken, pRider) {} //returns true if id of pRider is in pRiddenToken RidersFlag
	
	static isRider (pRiderToken) {} //returns true if pRiderToken is has Riding flag true
	
	static isRiderID (pRiderTokenID) {} //returns true if pRiderTokenID matches Token which has Riding flag true
	
	static RiderTokenIDs (pRiddenToken) {} //returns array of Ridder IDs that ride pRiddenToken (empty if it is not ridden)
	
	//flag setting
	static addRiderTokens (pRiddenToken, pRiderTokens) {} //adds the IDs of the pRiderTokens to the ridden Flag of pRiddenToken
	
	static removeRiderTokens (pRiddenToken, pRiderTokens) {} //removes the IDs of the pRiderTokens from the ridden Flag of pRiddenToken
	
	static recheckRiding (pRiderTokens) {} //rechecks to see of Ridden Token still exists
	
	static stopRiding(pRidingTokens) {} //tries to remove pRidingToken from all Riders Flags
	
	static removeallRiding(pRiddenToken) {} //stops all Tokens riding pRiddenToken from riding pRiddenToken
	//IMPLEMENTATIONS
	
	//flags handling support
	
	static #RideableFlags (pToken) {	
	//returns all Module Flags of pToken (if any) (can contain Riding and Riders Flags)
		if (pToken) {
			if (pToken.document) {
				if (pToken.document.flags.Rideable) {
					return pToken.document.flags.Rideable;
				}
			}
			else if (pToken.flags.Rideable) { //in case pToken is a document (necessary for token deletion)
				return pToken.flags.Rideable;
			}
		}
		
		return; //if anything fails
	} 
	
	static #RidingFlag (pToken) { 
	//returns content of Riding Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.RidingFlag) {
				return vFlag.RidingFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #RidersFlag (pToken) {
	//returns content of Riders Flag of pToken (if any) (array of id strings)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.RidersFlag) {
				return vFlag.RidersFlag;
			}
		}
		
		return []; //default if anything fails
	} 
	
	static #setRidingFlag (pToken, pContent) {
	//sets content of RiddenFlag (must be boolean)
		if ((pToken)) {
			pToken.document.setFlag(cModule, "RidingFlag", Boolean(pContent));
			
			return true;
		}
		return false;
	} 
	
	static #setRidersFlag (pToken, pContent) {
	//sets content of RiddenFlag (must be array of strings)
		if ((pToken) && (Array.isArray(pContent))) {
			pToken.document.setFlag(cModule, cRidersF, pContent.filter(vID => vID != pToken.id));
			
			return true;
		}
		return false;
	}
	
	static #resetFlags (pToken) {
	//removes all Flags
		if (pToken) {
			pToken.document.unsetFlag(cModule, cRidingF);
			pToken.document.unsetFlag(cModule, cRidersF);
			
			return true;
		}
		return false;
	} 
	
	//flag handling	
	//flag information
	static isRidden (pRiddenToken) {	
		return (this.#RidersFlag(pRiddenToken).length > 0);
	}
	
	static isRiddenID (pRiddenTokenID) {
		let vToken = RideableUtils.TokenfromID(pRiddenTokenID);
		
		if (vToken) {
			return isRidden(vToken);
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
	
	static isRiderID (pRiderTokenID) {
		let vToken = RideableUtils.TokenfromID(pRiderTokenID);
		
		if (vToken) {
			return this.isRider(vToken);
		}
		
		return false;
	}
	
	static RiderTokenIDs (pRiddenToken) {
		return this.#RidersFlag(pRiddenToken);
	}
	
	//flag setting
	static addRiderTokens (pRiddenToken, pRiderTokens) {
		if (pRiddenToken) {
			let vValidTokens = pRiderTokens.filter(vToken => !this.isRider(vToken) && (vToken != pRiddenToken)); //only Tokens which currently are not Rider can Ride and Tokens can not ride them selfs
			
			if (this.#setRidersFlag(pRiddenToken, this.#RidersFlag(pRiddenToken).concat(RideableUtils.IDsfromTokens(vValidTokens)))) {
				for (let i = 0; i < vValidTokens.length; i++) {
					if (vValidTokens[i]) {
						this.#setRidingFlag(vValidTokens[i],true);
					}
				}				
			}
		}
	}
	
	static removeRiderTokens (pRiddenToken, pRiderTokens) {
		if (pRiddenToken) {
			let vValidTokens = pRiderTokens.filter(vToken => this.isRiddenby(pRiddenToken, vToken)); //only Tokens riding pRiddenToken can be removed
			
			let vnewRiderIDs = this.#RidersFlag(pRiddenToken).filter(vID => !(RideableUtils.IDsfromTokens(vValidTokens).includes(vID)));
			
			this.#setRidersFlag(pRiddenToken, vnewRiderIDs);
			
			for (let i = 0; i < pRiderTokens.length; i++) {
				this.#setRidingFlag(pRiderTokens[i], false);
			}
		}
	}
	
	static recheckRiding (pRiderTokens) {
		if (pRiderTokens) {
			for (let i = 0; i < pRiderTokens.length; i++) {
				this.#setRidingFlag(pRiderTokens[i], Boolean(canvas.tokens.placeables.find(vTokens => this.isRiddenby(vTokens, pRiderTokens[i]))));
			}
		}
	}
	
	static stopRiding (pRidingTokens) {
		if (pRidingTokens) {
			for (let i = 0; i < pRidingTokens.length; i++) {
				if (pRidingTokens[i]) {
					let vRidingToken = pRidingTokens[i];
					
					let vRiddenTokens = canvas.tokens.placeables.filter(vToken => this.isRiddenby(vToken, vRidingToken));
					
					if (vRiddenTokens.length) {
						for (let j = 0; j < vRiddenTokens.length; j++) {
							this.removeRiderTokens(vRiddenTokens[j], pRidingTokens);
						}
					}
					else {
						this.#setRidingFlag(vRidingToken, false);
					}
				}
			}
		}
		
		//this.recheckRiding(pRidingTokens);
	}
	
	static removeallRiding (pRiddenToken) {
		if (pRiddenToken) {
			removeRiderTokens(pRiddenToken, RideableUtils.TokensfromID(RiderTokenIDs(pRiddenToken)));
			
			this.#setRidersFlag(pRiddenToken, []);
		}
		
		return this.isRidden(pRiddenToken);
	}
}

//Export RideableFlags Class
export{ RideableFlags };