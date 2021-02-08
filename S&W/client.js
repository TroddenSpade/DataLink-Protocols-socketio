// این قسمت کد مربوط به کلاینت می باشد
//می توان این قسمت را مستقل از سرور بر روی یک سرور یا یک دستگاه دیگر اجرا کرد و قابلیت کلاینت بودن را دارد

console.log("///////////////////////\n Client - Stop and Wait\n///////////////////////\n\n")

// برای اتصال از سوکت استفاده میکنیم به همین دلیل پکیج ساکت آی او را به یک متفیر نسبت می دهیم
var io = require('socket.io-client');
var socket = io.connect('http://localhost:8000');// از آدرس لوکال هاست و پورت ۸۰۰۰ برای اتصال استفاده می کنیم

let message = '' // در اینجا پیامی که دریافت می شود ذخیره می کنیم
let received_index = -1 // در اینجا ایندکس دریافت شده را ذخیره میکنیم در ابتدا -۱ یعنی صفر را نگرفته ایم

async function send(ack){ // در کد های دیگر توضیح داده شده
    await sleep(10)
    output(ack, message)
    socket.emit('media', ack)
}

socket.on('media', async (frame)=>{ // در کد های دیگر توضیح داده شده
    await sleep(2000) // prop dalay time
    received(frame)
})

socket.on('finished',()=>{ // در کد های دیگر توضیح داده شده
    console.log('\n *** Message Received: ' + message)
})

function sleep(ms) { // در کد های دیگر توضیح داده شده
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

function output(frame, message, seq){ // در کد های دیگر توضیح داده شده
    if(typeof seq !== "undefined") {
        console.log("-" + getTime() + " | RECV | SEQ: " + seq + " | Frame: " + frame + " | " + "Message: " + message)
    }else{
        console.log("-" + getTime() + " | SENT | " + "ACK")
    }
}

function getTime(){ // در کد های دیگر توضیح داده شده
    return new Date().toISOString().slice(11,23)
}

/////////////////////////////////////////////


function received(frame){ // در صورتی که فریمی دریافت شود این تابع صدا زده خواهد شد
    [index, str] = decode_frame(frame) // فریم را دیکد می کند
    if(received_index < index){ // اگر اندیسی باشد که دریافت نشده است رشته ی دیکد شده را به پیام اضافه می کند
        message += str
        received_index = index // و اندیس دریافتی را برابر ایندس قرار می دهد
    }
    output(frame, str, index) // خروجی دریافت شده را نشان می دهد
    if(Math.random() < 0.3)
        send(1) // و یک اک می فرستد
    
}


function decode_frame(frame){ // در کد های دیگر توضیح داده شده
    str = ""
    index_bin = frame.substring(0,8)
    index = parseInt(index_bin, 2)
    for(let i=8; i<frame.length; i+=8){
        char_bin = frame.substring(i,i+8)
        char_code = parseInt(char_bin, 2)
        if(char_code != 0){
            str += String.fromCharCode(char_code)
        }
    }
    return [index, str]
}