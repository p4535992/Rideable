import * as FCore from "./CoreVersionComp.js";

import { RideableFlags, cCornermaxRiders } from "./helpers/RideableFlags.js";
import { RideableUtils, cModuleName } from "./utils/RideableUtils.js";
import { RideablePopups } from "./helpers/RideablePopups.js";
import { GeometricUtils, cGradtoRad } from "./utils/GeometricUtils.js";

//positioning options
const cRowplacement = "RowPlacement"; //place all tokens in a RowPlacement
const cCircleplacement = "CirclePlacement"; //place all tokens in a circle
const cBlockplacement = "BlockPlacement"; //place all tokens in a Block
const cClusterplacement = "ClusterPlacement"; //place all tokens in a Cluster

const cPlacementPatterns = [cRowplacement, cCircleplacement, cClusterplacement];

export { cRowplacement, cPlacementPatterns };

const cSizeFactor = 2/3;

//Ridingmanager will do all the work for placing riders and handling the z-Height
class Ridingmanager {
	//DECLARATIONS
	static OnTokenupdate(pToken, pchanges, pInfos) {} //calculates which Tokens are Riders of priddenToken und places them on it
	
	static OnTokenpreupdate(pToken, pchanges, pInfos, psendingUser) {} //Works out if Rider has moved independently
	
	static UpdateRidderTokens(priddenToken, pRiderTokenList, pAnimations = true) {} //Works out where the Riders of a given token should be placed and calls placeRiderTokens to apply updates
	
	static OnIndependentRidermovement(pToken, pchanges, pInfos, pRidden, psendingUser) {} //Handles what should happen if a rider moved independently
	
	static async planRiderTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {} //Works out where the Riders of pRiddenToken should move based on the updated pRiddenToken
	
	static planPatternRidersTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {} //works out the position of tokens if they are spread according to a set pattern
	
	static placeRiderHeight(pRiddenToken, pRiderTokenList, pPlaceSameheight = false) {} //sets the appropiate riding height (elevation) of pRiderTokenList based on pRiddenToken
	
	static async fitRiders(pRiddenToken, pRiderTokenList, pSizeFactor = cSizeFactor) {} //reduces the size of all tokens that are equal or greater in size to their ridden token to pSizeFactor of ridden token
	
	static planRelativRiderTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {} //works out the position of tokens if they can move freely on pRiddenToken
	
	//DEPRICATED:
	//static placeRiderTokensPattern(priddenToken, pRiderTokenList, pxoffset, pxdelta, pallFamiliars = false, pAnimations = true) {} //Set the Riders(pRiderTokenList) token based on the Inputs (pxoffset, pxdelta, pbunchedRiders) und the position of priddenToken
	
	static placeRidersTokensRow(pRiddenToken, pRiderTokenList, pAnimations = true, pyoffset = []) {} //works out the position of tokens if they are spread according in a row
	
	static placeRiderTokenscorner(pRiddenToken, pRiderTokenList, pAnimations = true) {} //places up to four tokens from pRiderTokenList on the corners of priddenToken
	
	static placeTokenrotated(pRiddenToken, pRider, pTargetx, pTargety, pAnimation = true) {} //places pRider on pRidden using the pTargetx, pTargetx relativ to pRidden center position and rotates them is enabled
	
	static UnsetRidingHeight(pRiderTokens, pRiddenTokens) {} //Reduces Tokens Elevation by Riding height or sets it to the height of the previously ridden token
	
	//IMPLEMENTATIONS
	static OnTokenupdate(pToken, pchanges, pInfos) {
		if (game.user.isGM) {
			
			if (!pToken) {
				//get token from scene if not linked
				RideableUtils.TokenfromID(pToken.id, FCore.sceneof(pToken))
			}
			
			//Check if vToken is ridden
			if (RideableFlags.isRidden(pToken)) {
				//check if token position was actually changed
				if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y") || pchanges.hasOwnProperty("elevation") || (pchanges.hasOwnProperty("rotation") && game.settings.get(cModuleName, "RiderRotation"))) {
					//check if ridden Token exists
					let vRiderTokenList = RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pToken), FCore.sceneof(pToken));
					
					Ridingmanager.planRiderTokens(pToken, vRiderTokenList, pInfos.animate);
				}
			}
		}
	}
	
	static OnTokenpreupdate(pToken, pchanges, pInfos, psendingUser) {
		//Check if Token is Rider
		if (RideableFlags.isRider(pToken)) {
			if (pchanges.hasOwnProperty("x") || pchanges.hasOwnProperty("y") || pchanges.hasOwnProperty("elevation") || (pchanges.hasOwnProperty("rotation") && game.settings.get(cModuleName, "RiderRotation"))) {
				if (!pInfos.RidingMovement) {
					let vRidden = RideableFlags.RiddenToken(pToken);
					let vindependentRiderLeft = true;
					
					if (RideableFlags.RiderscanMoveWithin(vRidden) && !RideableFlags.isFamiliarRider(pToken) && !RideableFlags.isGrappled(pToken)) {
						let vNewPosition = GeometricUtils.NewCenterPosition(pToken, pchanges);
						
						if (GeometricUtils.withinBoundaries(vRidden, RideableFlags.TokenForm(vRidden), vNewPosition)) {
							vindependentRiderLeft = false;
							
							//update relativ position of Rider
							RideableFlags.setRelativPosition(pToken, GeometricUtils.Rotated(GeometricUtils.Difference(vNewPosition, GeometricUtils.CenterPosition(vRidden)), -vRidden.rotation));
						}
					}
					
					if (RideableFlags.isGrappled(pToken)) {
						vindependentRiderLeft = false;
						
						delete pchanges.x;
						delete pchanges.y;
						delete pchanges.elevation;
						delete pchanges.rotation;
				
						RideablePopups.TextPopUpID(pToken ,"PreventedGrappledMove", {pRiddenName : RideableFlags.RiddenToken(pToken).name}); //MESSAGE POPUP
					}
					
					if (vindependentRiderLeft) {
						Ridingmanager.OnIndependentRidermovement(pToken, pchanges, pInfos, vRidden, psendingUser);
					}
				}
			}
		}
	}
	
	static UpdateRidderTokens(priddenToken, pRiderTokenList, pAnimations = true) {
		if (priddenToken) {
			Ridingmanager.planRiderTokens(priddenToken, pRiderTokenList, pAnimations);
		}
	} 
	
	static OnIndependentRidermovement(pToken, pchanges, pInfos, pRidden, psendingUser) {
		let vGMoverride = false;
					
		if (psendingUser.isGM) {
			if ((!pchanges.hasOwnProperty("x") && !pchanges.hasOwnProperty("y") && pchanges.hasOwnProperty("elevation")) && !(game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-moveridden")) {
				//if a dm tried to only change the elevation while "move ridden" is off
				vGMoverride = true;
				
				RideableFlags.setRiderHeight(pToken, RideableFlags.RiderHeight(pToken) + (pchanges.elevation - pToken.elevation));
			}
		}
		
		if (!vGMoverride) {
			let vdeleteChanges = false;
			
			
			if ((game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-disallow")) {	
				//suppress movement
				vdeleteChanges = true;
				
				RideablePopups.TextPopUpID(pToken ,"PreventedRiderMove", {pRiddenName : RideableFlags.RiddenToken(pToken).name}); //MESSAGE POPUP
			}
			
			if (game.settings.get(cModuleName, "RiderMovement") === "RiderMovement-moveridden") {	
				//move ridden and stop own movement		
				if (pRidden) {
					if (pRidden.isOwner) {
						//can only change if you own vRidden
						
						let vxtarget = pRidden.x;								
						if (pchanges.hasOwnProperty("x")) {
							vxtarget = pRidden.x + (pchanges.x - pToken.x);
						}
						
						let vytarget = pRidden.y;
						if (pchanges.hasOwnProperty("y")) {
							vytarget = pRidden.y + (pchanges.y - pToken.y);
						}
						
						let vztarget = pRidden.elevation;		
						if (pchanges.hasOwnProperty("elevation")) {
							vztarget = pchanges.elevation - RideableUtils.Ridingheight(pRidden) - RideableFlags.RiderHeight(pToken);
						}
						
						let vrotationtarget = pRidden.rotation;	
						if (game.settings.get(cModuleName, "RiderRotation")) {
							vrotationtarget = pchanges.rotation;
						}
						
						pRidden.update({x: vxtarget, y: vytarget, elevation: vztarget, rotation: vrotationtarget}, {animate : pInfos.animate});
					}
					
					vdeleteChanges = true;
				}
				//if a rider has no ridden Token something went wrong, better not do anything else
			}
		
			if (vdeleteChanges) {
				delete pchanges.x;
				delete pchanges.y;
				delete pchanges.elevation;
				delete pchanges.rotation;
			}
			
			Hooks.call(cModuleName+".IndependentRiderMovement", pToken, pchanges)
		}
	}
	
	static async planRiderTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {
		let vRiderTokenList = pRiderTokenList;
		let vRiderFamiliarList = []; //List of Riders that Ride as familiars	
		let vGrappledList = [];
		
		if (game.settings.get(cModuleName, "Grappling")) { 
			vGrappledList = vRiderTokenList.filter(vToken => RideableFlags.isGrappled(vToken));
			
			vRiderTokenList = vRiderTokenList.filter(vToken => !vGrappledList.includes(vToken));
		}
		
		//Take care of rider height
		Ridingmanager.placeRiderHeight(pRiddenToken, vRiderTokenList);
		Ridingmanager.placeRiderHeight(pRiddenToken, vGrappledList, true);
		
		if (game.settings.get(cModuleName, "FamiliarRiding")) { 
		//split riders in familiars and normal riders
			vRiderFamiliarList = vRiderTokenList.filter(vToken => RideableFlags.isFamiliarRider(vToken));
				
			vRiderTokenList = vRiderTokenList.filter(vToken => !vRiderFamiliarList.includes(vToken));
		}
		
		//reduce size if necessary
		if (game.settings.get(cModuleName, "FitRidersize")) {
			await Ridingmanager.fitRiders(pRiddenToken, vRiderTokenList);
		}
    
		if (RideableFlags.RiderscanMoveWithin(pRiddenToken)) {
			Ridingmanager.planRelativRiderTokens(pRiddenToken, vRiderTokenList, pAnimations);
		}
		else {
			Ridingmanager.planPatternRidersTokens(pRiddenToken, vRiderTokenList, pAnimations);
		}
		
		//Familiars
		Ridingmanager.placeRiderTokenscorner(pRiddenToken, vRiderFamiliarList, pAnimations);
		
		//Grappled
		Ridingmanager.placeRidersTokensRow(pRiddenToken, vGrappledList, pAnimations, vGrappledList.map(vToken => (GeometricUtils.insceneHeight(vToken)+GeometricUtils.insceneHeight(pRiddenToken))/2));
	}
	
	static planPatternRidersTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {
		if (pRiderTokenList.length) {
			let vAngleSteps; //to fix javascript syntax bug
			
			switch (RideableFlags.RiderPositioning(pRiddenToken)) {
				case cCircleplacement:
					vAngleSteps = 360/pRiderTokenList.length;
					
					//calculate maximum placement heights and widths
					let vMaxHeight = 0;
					let vMaxWidth = 0;
					
					for (let i = 0; i < pRiderTokenList.length; i++) {
						vMaxHeight = Math.max(vMaxHeight, GeometricUtils.insceneHeight(pRiderTokenList[i]));
						vMaxWidth = Math.max(vMaxWidth, GeometricUtils.insceneWidth(pRiderTokenList[i]));
					}
					
					vMaxHeight = (GeometricUtils.insceneHeight(pRiddenToken) - vMaxHeight)/2;
					vMaxWidth = (GeometricUtils.insceneWidth(pRiddenToken) - vMaxWidth)/2;
					
					for (let i = 0; i < pRiderTokenList.length; i++) {
						Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vMaxWidth * Math.sin(vAngleSteps*cGradtoRad*i), -vMaxHeight * Math.cos(vAngleSteps*cGradtoRad*i), pAnimations);
					}	
					
					break;
					
				case cClusterplacement:
						let vSizeFactor = GeometricUtils.insceneSize(pRiddenToken);
				
						let vsortedTokens;
						let vsortedSizes;
						let vPlacementInterval = [0,0];
						vAngleSteps = 0;
						let vBaseRadius = 0;
						let vMaxSize;
						let vSizesumm;
						
						//sort tokens
						[vsortedTokens, vsortedSizes] = GeometricUtils.sortbymaxdim(pRiderTokenList);
						
						//place largest tokens first
						vsortedTokens.reverse();
						vsortedSizes.reverse();
						
						//for 0th token
						vMaxSize = vsortedSizes[0];
						
						while (vPlacementInterval[1] < vsortedTokens.length) {
							//placements						
							for (let i = vPlacementInterval[0]; i <= vPlacementInterval[1]; i++) {
								Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vBaseRadius * vSizeFactor * Math.sin(vAngleSteps*cGradtoRad*i), -vBaseRadius * vSizeFactor * Math.cos(vAngleSteps*cGradtoRad*i), pAnimations);
							}	
							
							vBaseRadius = vBaseRadius + vMaxSize/2;
							
							//new calculations
							vPlacementInterval[0] = vPlacementInterval[1] + 1;
							vPlacementInterval[1] = vPlacementInterval[0];
							
							vMaxSize = vsortedSizes[vPlacementInterval[0]];
							vSizesumm = vsortedSizes[vPlacementInterval[0]];
							
							//check if next element exists and fits in new circumference
							while (((vPlacementInterval[1]+1) < vsortedTokens.length) && ((2*vBaseRadius + Math.max(vsortedSizes[vPlacementInterval[1]+1], vMaxSize))*Math.PI > (vSizesumm + vsortedSizes[vPlacementInterval[1]+1]))) {
										
								vPlacementInterval[1] = vPlacementInterval[1] + 1;
								
								vMaxSize = Math.max(vMaxSize, vsortedSizes[vPlacementInterval[1]]);
								vSizesumm = vSizesumm + vsortedSizes[vPlacementInterval[1]];
							}
							
							vAngleSteps = 360/(vPlacementInterval[1] - vPlacementInterval[0] + 1);		

							vBaseRadius = vBaseRadius + vMaxSize/2;
						}
						
					break;
					
				case cRowplacement:
				default:
					Ridingmanager.placeRidersTokensRow(pRiddenToken, pRiderTokenList, pAnimations);
			}
		}
	} 
	
	static placeRiderHeight(pRiddenToken, pRiderTokenList, pPlaceSameheight = false) {
		for (let i = 0; i < pRiderTokenList.length; i++) {
			
			let vTargetz = pRiddenToken.elevation;
			
			if (!pPlaceSameheight) {
				vTargetz = vTargetz + RideableUtils.Ridingheight(pRiddenToken)/*game.settings.get(cModuleName, "RidingHeight")*/ + RideableFlags.RiderHeight(pRiderTokenList[i]);
			}
				
			if (pRiderTokenList[i].elevation != vTargetz) {
				pRiderTokenList[i].update({elevation: vTargetz}, {RidingMovement : true});
			}	
		}
	}
	
	static async fitRiders(pRiddenToken, pRiderTokenList, pSizeFactor = cSizeFactor) {
		for (let i = 0; i < pRiderTokenList.length; i++) {
			
			if ((pRiderTokenList[i].width >= pRiddenToken.width) && (pRiderTokenList[i].height >= pRiddenToken.height)) {
				await pRiderTokenList[i].update({width : pSizeFactor*pRiddenToken.width, height : pSizeFactor*pRiddenToken.height});
			}
		}		
	} 
	
	static planRelativRiderTokens(pRiddenToken, pRiderTokenList, pAnimations = true) {
		let vRiddenForm = RideableFlags.TokenForm(pRiddenToken);
		
		for (let i = 0; i < pRiderTokenList.length; i++) {
			let vTargetPosition = RideableFlags.RelativPosition(pRiderTokenList[i]);
			
			
			if (!RideableFlags.HasrelativPosition(pRiderTokenList[i])) {
				//if first time Rider give Border position
				vTargetPosition = GeometricUtils.closestBorderposition(pRiddenToken, vRiddenForm, GeometricUtils.TokenDifference(pRiderTokenList[i], pRiddenToken));
				
				vTargetPosition = GeometricUtils.GridSnap(vTargetPosition, FCore.sceneof(pRiddenToken).grid, [(pRiddenToken.width+pRiderTokenList[i].width)%2,(pRiddenToken.height+pRiderTokenList[i].height)%2]);
				
				RideableFlags.setRelativPosition(pRiderTokenList[i], vTargetPosition);
			}
			
			Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vTargetPosition[0], vTargetPosition[1], pAnimations);		
		}
	}
	
	static placeRidersTokensRow(pRiddenToken, pRiderTokenList, pAnimations = true, pyoffset = []) {
		if (pRiderTokenList.length) {
			let vbunchedRiders = true;
			let vxoffset = 0;
			let vxdelta = 0;
			
			let vRiderWidthSumm = 0;					
			for (let i = 0; i < pRiderTokenList.length; i++) {
				vRiderWidthSumm = vRiderWidthSumm + GeometricUtils.insceneWidth(pRiderTokenList[i]);
			}
			
			//if Riders have to be bunched
			if (vRiderWidthSumm > GeometricUtils.insceneWidth(pRiddenToken)) {
				vxoffset = -GeometricUtils.insceneWidth(pRiddenToken)/2 + GeometricUtils.insceneWidth(pRiderTokenList[0])/2;	
				if (pRiderTokenList.length > 1) {
					vxdelta = (GeometricUtils.insceneWidth(pRiddenToken) - (GeometricUtils.insceneWidth(pRiderTokenList[pRiderTokenList.length - 1]) + GeometricUtils.insceneWidth(pRiderTokenList[0]))/2)/(pRiderTokenList.length-1);
				}
			} 
			else { //if Riders dont have to be bunched
				vbunchedRiders = false;
				
				vxoffset = -vRiderWidthSumm/2 + GeometricUtils.insceneWidth(pRiderTokenList[0])/2;	
			}

			for (let i = 0; i < pRiderTokenList.length; i++) {
				//update riders position in x, y
				let vTargetx = 0;
				let vTargety = 0;
				
				if (vbunchedRiders) {
					vTargetx = vxoffset + i*vxdelta;
				}
				else {
					if (i > 0) {
						vTargetx = vxoffset + (GeometricUtils.insceneWidth(pRiderTokenList[i-1])+GeometricUtils.insceneWidth(pRiderTokenList[i]))/2;
						vxoffset = vTargetx;
					}
					else {
						vTargetx = vxoffset;
					}
				}
				
				if (pyoffset.length) {
					vTargety = pyoffset[i%pyoffset.length];
				}
				
				Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vTargetx, vTargety, pAnimations);		
			}
		}
	}
	
	static placeRiderTokenscorner(pRiddenToken, pRiderTokenList, pAnimations = true) {
		if (pRiderTokenList.length) {
			for (let i = 0; i < Math.min(Math.max(pRiderTokenList.length, cCornermaxRiders-1), pRiderTokenList.length); i++) { //no more then 4 corner places			
				let vTargetx = 0;
				let vTargety = 0;
				
				switch (i) {
					case 0: //tl
						vTargetx = -GeometricUtils.insceneWidth(pRiddenToken)/2;
						vTargety = -GeometricUtils.insceneHeight(pRiddenToken)/2;
						break;
						
					case 1: //tr
						vTargetx = GeometricUtils.insceneWidth(pRiddenToken)/2;
						vTargety = -GeometricUtils.insceneHeight(pRiddenToken)/2;
						break;
						
					case 2: //bl
						vTargetx = -GeometricUtils.insceneWidth(pRiddenToken)/2;
						vTargety = GeometricUtils.insceneHeight(pRiddenToken)/2;
						break;
						
					case 3: //br
						vTargetx = GeometricUtils.insceneWidth(pRiddenToken)/2;
						vTargety = GeometricUtils.insceneHeight(pRiddenToken)/2;
						break;
				}
				
				Ridingmanager.placeTokenrotated(pRiddenToken, pRiderTokenList[i], vTargetx, vTargety, pAnimations);		
			}
		}
	}
	
	static placeTokenrotated(pRiddenToken, pRider, pTargetx, pTargety, pAnimation = true) {	
		let vTargetx = pTargetx;
		let vTargety = pTargety;
		
		if (game.settings.get(cModuleName, "RiderRotation")) {
			//rotation
			[vTargetx, vTargety] = GeometricUtils.Rotated([pTargetx, pTargety], pRiddenToken.rotation);
			
			pRider.update({rotation: pRiddenToken.rotation}, {animate : pAnimation, RidingMovement : true});
		}
		
		vTargetx = pRiddenToken.x + GeometricUtils.insceneWidth(pRiddenToken)/2 - GeometricUtils.insceneWidth(pRider)/2 + vTargetx;
		vTargety = pRiddenToken.y + GeometricUtils.insceneHeight(pRiddenToken)/2 - GeometricUtils.insceneHeight(pRider)/2 + vTargety;
			
		if ((pRider.x != vTargetx) || (pRider.y != vTargety)) {
			pRider.update({x: vTargetx, y: vTargety}, {animate : pAnimation, RidingMovement : true});
		}
	}
	
	static UnsetRidingHeight(pRiderTokens, pRiddenTokens) {
		for (let i = 0; i < pRiderTokens.length; i++) {
			if (pRiderTokens[i] && pRiderTokens[i]) {
				let vTargetz = 0;
				
				if (pRiddenTokens[i]) {
					//set to height or previously ridden token
					vTargetz = pRiddenTokens[i].elevation;
				}
				else {
					//reduce height by riding height
					vTargetz = pRiderTokens[i].elevation - RideableUtils.Ridingheight();
				} 

				pRiderTokens[i].update({elevation: vTargetz}, {RidingMovement : true});
			}
		}
	}
}

//export

function UpdateRidderTokens(priddenToken, vRiderTokenList, pAnimations = true) {
	Ridingmanager.UpdateRidderTokens(priddenToken, vRiderTokenList, pAnimations);
}
function UnsetRidingHeight(pRiderTokens, pRiddenTokens) {
	Ridingmanager.UnsetRidingHeight(pRiderTokens, pRiddenTokens);
}

export { UpdateRidderTokens, UnsetRidingHeight };

//Set Hooks
Hooks.on("updateToken", (...args) => Ridingmanager.OnTokenupdate(...args));

Hooks.on("preUpdateToken", (...args) => Ridingmanager.OnTokenpreupdate(...args));
