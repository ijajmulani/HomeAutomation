//   9, 10,  11, 17, 18, 22 , 23 , 27
$(function() {
  var pubnub = new PubNub({
    publishKey : '',
    subscribeKey : ''
  }),
  sender_id = "mobile";



  $('.js-btn').on('click', function(){
    var $btn = $(this),
        instrumentName = $btn.data('instrument'),
        state;

    $btn.attr('disabled', 'disabled');
    state = $btn.data('state') === 0  ? 1 : 0;
    $btn.addClass('activating');
    publishSampleMessage(instrumentName, state)

    setTimeout(function() {
      $btn.removeAttr('disabled');
    }, 200);
  });

  pubnub.addListener({
      status: function(statusEvent) {
          if (statusEvent.category === "PNConnectedCategory") {
            // publishSampleMessage();
          }
      },
      message: function(message) {
        var message = message.message;
        if (message.sender_id !== sender_id) {
          console.log("New Message!!", message);
          if (message.type = "status") {
            for (var key in message.state) {
              var pin = key,
                  state = message.state[key];
              if (state) {
                $('.js-btn[data-instrument = ' + pin+ ']').addClass('activate').removeClass('activating').data('state', state);
              } else {
                $('.js-btn[data-instrument = ' + pin+ ']').removeClass('activate activating').data('state', state);
              }
            }
          }  
        }
      },
      presence: function(presenceEvent) {
        // handle presence
      }
  });  
  console.log("Subscribing..");
  pubnub.subscribe({
    channels: ['automation'] 
  });

  function publishSampleMessage(instrumentName, state) {
    var message,
        operationArray = ['ALL', 'send_status'];
    console.log(operationArray);
    if ($.inArray(instrumentName, operationArray) !== -1) {
      message = {'operation': instrumentName, 'state': state};
    } else {
      message = {'pin_number': instrumentName, 'state': state };
    }


    message['sender_id'] = sender_id;
    var publishConfig = {
      channel : "automation",
      message : message
    };

    pubnub.publish(publishConfig, function(status, response) {
      console.log(status, response);
    });
  }
});
