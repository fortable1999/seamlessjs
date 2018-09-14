//
//
// Seamless scrolling
//
//


//***************
// Private variables
//***************
var block_now = 0;
var prefix = "block-";


//***************
// Configure methods
//***************
function getSeamlessConfig() {
    var workspace = document.getElementById("seamless");
    return {
        blockSize: eval(workspace.getAttribute('seamless-block-size')),
    }
}


//***************
// Template methods
//***************
function getSeamlessTemplate(){
    return document.getElementById(prefix + 'template');
}


//***************
// Data methods
//***************
function getSeamlessData() {
    var workspace = document.getElementById("seamless");
    return eval(workspace.getAttribute('seamless-data'))
}

function getBlockData(block_idx){
    var blockSize = getSeamlessConfig().blockSize;
    return getSeamlessData().slice(block_idx * blockSize, (block_idx + 1) * blockSize);
}

function getBlockDataMaxBlock(){
	var blockSize = getSeamlessConfig().blockSize;
    return Math.ceil(getSeamlessData().length / blockSize);
}


//***************
// Block methods
//***************
function getPreviousBlock(){
    if (block_now <= 0) {
        return
    }
    return document.getElementById(prefix + (block_now - 1).toString());
}

function createBlockFromTemplate(){
    var template = getSeamlessTemplate();
    var block = template.cloneNode(true);
    return block
}

function getCurrentBlock(){
    return document.getElementById(prefix + block_now.toString());
}

function getNextBlock(){
    return document.getElementById(prefix + (block_now + 1).toString());
}

function blockGetIndex(block){
    return parseInt(block.id.split("-")[1]);
}

function blockSetIndex(block, idx){
    block.id = prefix + idx.toString()
}


//***************
// Drawing
//***************
function drawBlock(block) {
    var workspace = document.getElementById("seamless");
    workspace.appendChild(block);
}

function drawData(block, data) {
    var cellTemplate = document.getElementById("cell-template");
    var fragment = document.createDocumentFragment();
    data.forEach(function(e){
        n = cellTemplate.cloneNode();
        n.innerHTML = e;
        fragment.appendChild(n);
    })
    block.appendChild(fragment);
}


//***************
// Preloading
//***************
function preloadCurrent(){
    var currentBlock = createBlockFromTemplate();
    blockSetIndex(currentBlock, block_now);
    currentBlock.style.top = 0;
    var currentData = getBlockData(block_now);
    drawData(currentBlock, currentData);
    drawBlock(currentBlock);
}

function preloadNext(){
    var nextData = getBlockData(block_now + 1);
	if (nextData.length < 1) {
		return
	}
    var currentBlock = getCurrentBlock();
    var nextBlock = createBlockFromTemplate();
    blockSetIndex(nextBlock, block_now + 1);
    nextBlock.style.top = currentBlock.offsetTop + currentBlock.offsetHeight;
    drawData(nextBlock, nextData);
    drawBlock(nextBlock);
}

function preloadPrevious(){
    if (block_now > 0){
        var currentBlock = getCurrentBlock();
        var previousBlock = createBlockFromTemplate();
        blockSetIndex(previousBlock, block_now - 1);
        previousBlock.style.top = currentBlock.offsetTop - currentBlock.offsetHeight;
        var previousData = getBlockData(block_now-1);
        drawData(previousBlock, previousData);
        drawBlock(previousBlock);
    }
}


//***************
// Scrolling
//***************

function scrollBlock(block, deltaY) {
    block.style.top = block.offsetTop - deltaY;
}

function scrollBlockTop() {
	var previousBlock = getPreviousBlock();
	var currentBlock = getCurrentBlock();
	var nextBlock = getNextBlock();
	if (block_now == 0) {
		// set top. no preload
		currentBlock.style.top = 0;
		if (nextBlock) {
			nextBlock.style.top = currentBlock.offsetHeight;
		}
	} else {
		// remove all blocks, preload
		if (previousBlock) {
			previousBlock.remove();
		}
		currentBlock.remove();
		if (nextBlock) {
			nextBlock.remove();
		}
		seamlessInitialize(0);
	}
}

function scrollBlockBottom() {
	var previousBlock = getPreviousBlock();
	var currentBlock = getCurrentBlock();
	var nextBlock = getNextBlock();
	if (block_now + 1 >= getBlockDataMaxBlock()) {
		// set top. no preload
		currentBlock.remove();
        preloadCurrent();
	    currentBlock = getCurrentBlock();
		currentBlock.style.top = window.innerHeight - currentBlock.offsetHeight;
		if (previousBlock) {
			previousBlock.style.top = window.innerHeight - currentBlock.offsetHeight - previousBlock.offsetHeight;
		}
	} else {
		// remove all blocks, preload
		if (previousBlock) {
			previousBlock.remove();
		}
		currentBlock.remove();
		if (nextBlock) {
			nextBlock.remove();
		}
		seamlessInitialize(getBlockDataMaxBlock()-1);
		scrollBlockBottom();
	}
}

function seamlessScroll() {
    var e = window.event;
	var deltaY = e.deltaY
    var previousBlock = getPreviousBlock();
    var currentBlock = getCurrentBlock();
    var nextBlock = getNextBlock();

    if (block_now == 0 && currentBlock.offsetTop >= 0 && deltaY <= 0){
        // stop scrolling at top
        currentBlock.style.top = 0;
		if (nextBlock) {
			nextBlock.style.top = currentBlock.offsetHeight;
		}
        return
    } else if (block_now + 1 == getBlockDataMaxBlock()  && currentBlock.offsetTop + currentBlock.offsetHeight <= window.innerHeight && deltaY > 0){
        // stop scrolling at bottom
        currentBlock.style.top = window.innerHeight - currentBlock.offsetHeight;
		if (previousBlock) {
			previousBlock.style.top = window.innerHeight - currentBlock.offsetHeight - previousBlock.offsetHeight;
		}
        return
    } 

	// Limit deltaY border bottom
	if (deltaY > 0) {
		if (nextBlock && deltaY > nextBlock.offsetTop + nextBlock.offsetHeight - window.innerHeight) {
			deltaY = nextBlock.offsetTop + nextBlock.offsetHeight - window.innerHeight;
		} else if ((nextBlock === undefined) && deltaY > currentBlock.offsetTop + currentBlock.offsetHeight - window.innerHeight) {
			deltaY = currentBlock.offsetTop + currentBlock.offsetHeight - window.innerHeight;
		}
	} else if (deltaY < 0) {
		if (previousBlock && deltaY < previousBlock.offsetTop) {
			deltaY = previousBlock.offsetTop;
		} else if ((previousBlock === undefined) && deltaY < currentBlock.offsetTop) {
			deltaY = currentBlock.offsetTop;
		}
	}

    scrollBlock(currentBlock, deltaY);
    if (previousBlock) {
        scrollBlock(previousBlock, deltaY);
    }
    if (nextBlock) {
        scrollBlock(nextBlock, deltaY);
    }

    if (deltaY > 0 && ((currentBlock.offsetTop + currentBlock.offsetHeight <= 0) || (nextBlock && nextBlock.offsetTop + nextBlock.offsetHeight <= window.innerHeight))) {
        // Scrolling down
        if (previousBlock) {
            previousBlock.remove();
        }
        block_now = block_now + 1;
        preloadNext();
    } else if (deltaY < 0 && currentBlock.offsetTop >= 0 && block_now > 0) {
        // Scrolling up
        if (nextBlock) {
            nextBlock.remove();
        }
        block_now = block_now - 1;
        preloadPrevious();
    }
}


//***************
// Initialization
//***************
function seamlessInitialize(block_init){
    if (block_init === undefined) {
        block_now = 0;
    } else {
		block_now = block_init;
	}
    preloadCurrent();
    preloadPrevious();
    preloadNext();
}

document.getElementById("seamless-scrollarea").onwheel = seamlessScroll;
