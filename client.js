var tempBidPrice = 0.00;
function getUpdates() {
	const ws = new WebSocket("ws://localhost:8080");
	ws.addEventListener("open", () =>{
	  console.log("Connection Build!!!");
	  ws.send("Initiate");
	});

	ws.addEventListener('message', function (event) {
	  var bidData = JSON.parse(event.data).XBTUSD['b'];
		var bidPrice = bidData[0]; // BID PRICE
		var bidVolume = bidData[2]; // VOLUME
		
		var ticker = $('.js-exchange-ticker');
		if (bidPrice > tempBidPrice) {
			ticker.removeClass('gg-arrow-down');
			ticker.addClass('gg-arrow-up');
		} else {
			ticker.addClass('gg-arrow-down');
			ticker.removeClass('gg-arrow-up');
		}
		tempBidPrice = bidPrice; // Reset Temp Bid Price
		
		$('.js-bid-price').text(tempBidPrice);
		$('.js-bid-volume').text(bidVolume);
	});
}