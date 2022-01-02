const api = "c4fa5234-0022-48d8-bc66-40d31150f912";


function saveAddressInStorage(address, secret) {
  var addresses = JSON.parse(localStorage.getItem("addresses"));
  if(addresses != null) {
    addresses.push({address:address, key: secret});
    
  }
  else {
    addresses = []
    addresses.push({address:address, key: secret});
  }
  localStorage.setItem("addresses", JSON.stringify(addresses));
}



function getFirstAddress() {
  var addresses = JSON.parse(localStorage.getItem("addresses"));
  return addresses[0];
}

function sendTransaction() {
  var address = getFirstAddress();
  var recipient = $('#trx_address').val();
  if(recipient == '') {
    $('#errorTrx').css("display","block");
    $('#errorTrx').text("Recipient is invalid");
    return;
  }
  var memo = $('#trx_memo').val();
  var amount = $('#trx_amount').val();
  if(amount == '') {
    $('#errorTrx').css("display","block");
    $('#errorTrx').text("Amount is invalid");
    return;
  }
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api-us-west1.tatum.io/v3/algorand/transaction",
    "method": "POST",
    "headers": {
      "content-type": "application/json",
      "x-api-key": api
    },
    "processData": false,
    "data": "{\"from\":\""+address.address+"\",\"to\":\""+recipient+"\",\"fee\":\"0.001\",\"amount\":\""+amount+"\",\"note\":\""+memo+"\",\"fromPrivateKey\":\""+address.key+"\"}"
  };
  
  $.ajax(settings).done(function (response) {
    $('#errorTrx').css("display","none");
    $('#errorTrx2').css("display","block");
    $('#errorTrx2').text('The transaction is valid and successfully execute with id '+response);
    checkBalance();
    console.log(response);
  }).fail(function (response) {
    $('#errorTrx').css("display","block");
    $('#errorTrx2').css("display","none");
    $('#errorTrx').text('There was an error with your transaction. Check the form.');
    response.responseJSON.data[0].
    console.log(response);
  });
}


function generateWallet()
{
    const mnemotic = $('#mnemoticWallet').val();
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": mnemotic !== "" ? "https://api-us-west1.tatum.io/v3/algorand/wallet?mnemonic="+mnemotic : "https://api-us-west1.tatum.io/v3/algorand/wallet",
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $.ajax(settings).done(function (response) {
        console.log(response);
        $('#new_address_generated').show();
        $('#new_wallet_address').text(response.address);
        $('#new_wallet_secret').text(response.secret);
        saveAddressInStorage(response.address, response.secret);
      });
}

function confirmKeySaved() {
  localStorage.authenticated = "true";
  location.href = 'index.html';
}

function generateWalletFromPrivateKey()
{
    const privateKey = $('#pvKeyValue').val();
    if(privateKey != '') {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/algorand/address/"+privateKey,
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $.ajax(settings).done(function (response) {
        saveAddressInStorage(response, privateKey);
        confirmKeySaved();

      }).fail(function (response) {
        $('#errorLogin').css("display","block");
        $('#errorLogin').text('The private key is not valid.');
        
      });
    }
    else {
      $('#errorLogin').css("display","block");
        $('#errorLogin').text('The private key is not valid.');
        
    }
}

function checkBalance()
{
    const publicAddress = getFirstAddress().address;
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/algorand/account/balance/"+publicAddress,
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $.ajax(settings).done(function (response) {
        $('.view_balance_address').text(response);
      });
}

function checkCurrentBlock() {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/algorand/block/current",
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $.ajax(settings).done(function (response) {
        $('.view_block_number').text(response);
        console.log(response);
      });
}

function getBlockData(blockNumber)
{
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/algorand/block/"+blockNumber,
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $.ajax(settings).done(function (response) {
        console.log(response);
      });
}

function checkAddress()
{
  const address = $('#verify_address').val();
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/security/address/"+address,
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $('#is_valid_address').css('display',"block");
      $.ajax(settings).done(function (response) {
        if(response.status == 'valid') {
          $('#is_valid_address').text('The address '+address+" is valid");
        }
        else {
          $('#is_valid_address').text('The address '+address+" is not valid");
        }
        console.log(response);
      }).fail(function (response) {
          $('#is_valid_address').text('The address '+address+" is not valid");
        console.log(response);
      });
}

function logout() {
  localStorage.clear();
  location.href = 'login.html';
}
    

setInterval(
    checkCurrentBlock(),30000
);

$(function()
{
  if(localStorage.authenticated != null) {
    checkBalance();
    var address = getFirstAddress().address;
    $('.current_account').qrcode(address);
    $('.current_account_text').text(address);

  }
  
    $('#generateWalletButton').click(
        function() {
        generateWallet()});

    $('#generateWalletPrivKeyButton').click(
        function() {
            generateWalletFromPrivateKey()});

    $('#confirmKeySavedButton').click(
      function() {
        confirmKeySaved()});

    $('#verifyAddressButton').click(
      function() {
        checkAddress()});
    $('#btnLogout').click(
      function() {
        logout()});

    $('#sendTrxButton').click(
      function() {
        sendTransaction()});
    
}
    
);