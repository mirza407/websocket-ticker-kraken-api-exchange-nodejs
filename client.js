var tempBidPrice = 0.00;
var bitrexBidPrice = 0.00;
var bitsBidPrice = 0.00;
function getUpdates() {
	const ws = new WebSocket("ws://localhost:8080");
	ws.addEventListener("open", () =>{
	  console.log("Connection Build!!!");
	  ws.send("Initiate");
	});

	ws.addEventListener('message', function (event) {
	    var bid = JSON.parse(event.data);
		if(bid && bid.kraken){
			var bidData = bid.kraken.b;
			var bidPrice = bidData[0]; // BID PRICE
			var bidVolume = bidData[2]; // VOLUME
			
			var ticker = $('.js-exchange-ticker');
			if (bidPrice >= tempBidPrice) {
				ticker.removeClass('gg-arrow-down');
				ticker.addClass('gg-arrow-up');
			} else {
				ticker.addClass('gg-arrow-down');
				ticker.removeClass('gg-arrow-up');
			}
			tempBidPrice = bidPrice; // Reset Temp Bid Price
			
			$('.js-bid-price').text(tempBidPrice);
			$('.js-bid-volume').text(bidVolume);
		}

		if(bid && bid.bittrex){
			var bidData = bid.bittrex;
			var bidPrice = bidData.bidRate; // BID PRICE
			var bidVolume = bidData.askRate; // Ask Rate
			
			var ticker = $('.bittrex-js-exchange-ticker');
			if (bidPrice >= bitrexBidPrice) {
			ticker.removeClass('gg-arrow-down');
			ticker.addClass('gg-arrow-up');
			} else {
			ticker.addClass('gg-arrow-down');
			ticker.removeClass('gg-arrow-up');
			}
			bitrexBidPrice = bidPrice; // Reset Temp Bid Price
			
			$('.bit-bid-price').text(bitrexBidPrice);
			$('.bit-bid-volume').text(bidVolume);
		}

		if(bid && bid.bitsmap){
			var bidData = bid.bitsmap;
			var bidPrice = bidData.price; // BID PRICE
			var bidVolume = bidData.amount; // Amount
			
			var ticker = $('.bits-js-exchange-ticker');
			if (bidPrice >= bitsBidPrice) {
			ticker.removeClass('gg-arrow-down');
			ticker.addClass('gg-arrow-up');
			} else {
			ticker.addClass('gg-arrow-down');
			ticker.removeClass('gg-arrow-up');
			}
			bitsBidPrice = bidPrice; // Reset Temp Bid Price
			
			$('.bits-bid-price').text(bitsBidPrice);
			$('.bits-bid-volume').text(bidVolume);
		}
	});
}
