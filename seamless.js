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
    var currentBlock = getCurrentBlock();
    var nextBlock = createBlockFromTemplate();
    blockSetIndex(nextBlock, block_now + 1);
    nextBlock.style.top = currentBlock.offsetTop + currentBlock.offsetHeight;
    var nextData = getBlockData(block_now + 1);
	if (nextData.length < 1) {
		return
	}
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
    block.style.top = parseInt(block.style.top) - deltaY;
}

function seamlessScroll() {
    var e = window.event;
    var previousBlock = getPreviousBlock();
    var currentBlock = getCurrentBlock();
    var nextBlock = getNextBlock();

    if (block_now == 0 && currentBlock.offsetTop >= 0 && e.deltaY <= 0){
        // stop scrolling at top
        currentBlock.style.top = 0;
		if (nextBlock) {
			nextBlock.style.top = currentBlock.offsetHeight;
		}
        return
    } else if (block_now + 1 == getBlockDataMaxBlock()  && currentBlock.offsetTop + currentBlock.offsetHeight <= window.innerHeight && e.deltaY > 0){
        // stop scrolling at bottom
        currentBlock.style.top = window.innerHeight - currentBlock.offsetHeight;
		if (previousBlock) {
			previousBlock.style.top = window.innerHeight - currentBlock.offsetHeight - previousBlock.offsetHeight;
		}
        return
    } else if (nextBlock && block_now + 2 == getBlockDataMaxBlock()  && nextBlock.offsetTop + nextBlock.offsetHeight <= window.innerHeight && e.deltaY > 0){
        // stop scrolling at bottom
		nextBlock.style.top = window.innerHeight - nextBlock.offsetHeight;
        currentBlock.style.top = window.innerHeight - currentBlock.offsetHeight - nextBlock.offsetHeight;
		if (previousBlock) {
			previousBlock.style.top = window.innerHeight - nextBlock.offsetHeight - currentBlock.offsetHeight - previousBlock.offsetHeight;
		}
        return
    }

    scrollBlock(currentBlock, e.deltaY);
    if (previousBlock) {
        scrollBlock(previousBlock, e.deltaY);
    }
    if (nextBlock) {
        scrollBlock(nextBlock, e.deltaY);
    }

    if (e.deltaY > 0 && parseInt(currentBlock.style.top) + currentBlock.offsetHeight <= 0) {
		console.log(">>>>>", e.deltaY > 0, parseInt(currentBlock.style.top) + currentBlock.offsetHeight <= 0, previousBlock, block_now);
        // Scrolling down
        if (previousBlock) {
            previousBlock.remove();
        }
        block_now = block_now + 1;
        preloadNext();
		console.log("<<<<", e.deltaY > 0, parseInt(currentBlock.style.top) + currentBlock.offsetHeight <= 0, previousBlock, block_now);
    } else if (e.deltaY < 0 && parseInt(currentBlock.style.top) >= 0 && block_now > 0) {
        // Scrolling up
        if (nextBlock) {
            nextBlock.remove();
        }
        block_now = block_now - 1;
        preloadPrevious();
		console.log("<<<<___", e.deltaY > 0, parseInt(currentBlock.style.top) + currentBlock.offsetHeight <= 0, previousBlock, block_now);
    }
}


//***************
// Initialization
//***************
function seamlessInitialize(block_init){
    if (block_init) {
        block_now = block_init;
    }
    preloadCurrent();
    preloadPrevious();
    preloadNext();
}

document.getElementById("seamless-scrollarea").onwheel = seamlessScroll;
