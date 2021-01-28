// این قسمت کد مربوط به سرور می باشد
//می توان این قسمت را مستقل از کلاینت بر روی یک سرور یا یک دستکاه دیگر اجرا کرد و قابلیت سرور بودن را دارد

console.log("///////////////////////\n Server - Stop and Wait\n///////////////////////\n")

// برای اتصال از سوکت استفاده میکنیم به همین دلیل پکیج ساکت آی او را به یک متفیر نسبت می دهیم
var io = require('socket.io')
var server = io(8000) // از آدرس لوکال هاست و پورت ۸۰۰۰ برای اتصال استفاده می کنیم

// پیامی که میخواهیم ارسال کنیم و تعداد بایت های فریم را به عنوان پارامتر می دهیم
// هنگام اجرا این مقادیر را با دستور بر روی ترمینال اجرا می کنیم
var message = process.argv[3]
var num = parseInt(process.argv[2])

// در اینجا سرور سوکت منتظر اتصال یک کلاین به آن می شود
server.on("connection", async (socket) => { // اگر کلاینتی وصل شد این تابع اجرا می شود
    console.info(`Client connected [id=${socket.id}]\n`); // نشان می دهد یک کلاینت وصل شده است
    socket.on("disconnect", () => { // در صورتی که کلاینت دیسکانکت شود پیامی نشان داده می شود
        console.info(`Client gone [id=${socket.id}]`); // که کلاینت با این آیدی دیسی شده است
    });

     // در اینجا یک تابع می سازیم که فرستادن را شبیه سازی می کند
    async function send(frame){ // متغیر فریم را میگیرد
        tm = timeout() // یک تایم اوت می سازد
        await sleep(10*frame.length) // ابتدا برای قرار دادن هر بیت بر روی مدیا ۱۰ نانو ثانیه وقت میگیرد
        output(message.substring(index * num, (index+1)*num), frame) // سپس چاپ می کند که این فریم با این شماره فرستاده شده است
        socket.emit('media',frame) // برای فرستادن در سوکت از تابع امیت استفاده می کنیم و در کانالی به اسم مدیا میفرستیم
    }

     // در اینجا سوکت به کانال مدیا گوش میدهد در صورتی که فریمی دریافت کند تابع زیر اجرا می شود
    socket.on('media', async (frame)=>{
        await sleep(2000) // در اینجا مدت زمان انتشار شبیه سازی شده که ۲ ثانیه می باشد
        output(frame) // سپس چاپ می شود که چه مقداری را گرفته است
        received_ack() // سپس این تابع را اجرا می کنیم
    })

    ///////////////////////////////////////////////////

    frames = create_frames(message, num) //  فریم هارا از روی تعداد بایت های ارسالی و پیام داده شده می سازیم
    console.log("Frames: " , frames) // فریم هارا نمایش می دهیم
    index = 0 // اندیسی که میخواهیم بفرستیم
    
    console.time("\n transmission Time: "); // زمان شروع را در نظر میگیریم
    send(frames[index]) // اولیت فریم را می فرستیم

    function received_ack(){ // اگر اک دریافت کردیم اجرا می شود
        clearTimeout(tm); // تایم اوت را پاک می کنیم
        index += 1 // اندیس را یکی جلوتر می بریم
        if(index < frames.length){ // تا زمانی که فریم باشد ارسال می کنیم
            send(frames[index])
        }else{ // در غیر این صورت زمان کل را نمایش می دهیم و پیامی در اتمام می فرستیم
            console.timeEnd("\n transmission Time: ");
            socket.emit('finished')
        }
    }

    function timeout(){ // یک تایم اوت می سازد و آن را بر می گرداند
        return setTimeout(async () => {
            console.log("*** Time Out ***")
            send(frames[index]) // اگر زمانش تمام شده بود پیامی چاپ و فریم دوباره ارسال می شود
        }, 10000);
    }
});


function create_frames(str, num){ // این تابع رشته و تعداد بایت های هر فریم را می گیرد
    frames = [] // ارایه ای برای فریم ها می سازد
    for (let i = 0; i< str.length; i+=num){ // برای هر چند کاراکتر این کار را انجام می دهد :و
        frame = "" // فریم خالی
        index_bin = (i/num).toString(2) // اندیس شروع که برابر اندیس کاراکتر بر تعداد است را به مبنای دو تبدیل می کند
        frame += ('00000000' + index_bin).slice(-8) // این اندیس را در هشت بیت جا می دهد و در ابتدای فریم می گذارد

        for(let j=i; j<i+num; j++){ // سپس برای تعداد بایت هایی که مشخص کرده ایم
            if(j < str.length){ // اگر کاراکتری بود
                char_bin = str.charCodeAt(j).toString(2)  // یک کاراکتر میگیرد و به یک باینری تبدیل می کند
                frame += ('00000000' + char_bin).slice(-8) // آنرا در هشت بیت جا می دهد و به فریم اضافه می کند
            }else{ // اگر کاراکتری نبود و رشته تمام شده بود بایت ۰ میفرستد
                frame += '00000000'
            }
        }

        frames.push(frame) // فریم را به آرایه اضافه می کند
    }
    return frames // آرایه را بر می گرداند
}

function output(char, frame){ // برای نمایش خروجی می باشد اهمیتی ندارد :D
    if(typeof frame !== "undefined") {
        console.log("-" + getTime() + " | SENT | " + "SEQ: " + index +  " | Msg: " + char + " | " + "Frame: " + frame)
    }else{
        console.log("-" + getTime() + " | RECV | " + "ACK : " + char )
    }
}

function sleep(ms) { // ساخت تابع اسلیپ با استفاده از پرامیس و یک تایم اوت صورت می گیرد
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

function getTime(){ // زمان را با فرمت مناسبی بر می گرداند
    return new Date().toISOString().slice(11,23)
}