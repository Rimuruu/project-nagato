

require('dotenv').config();

const { Readable } = require('stream');
const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);

class Silence extends Readable {
  _read() {
    this.push(SILENCE_FRAME);
    this.destroy();
  }
}


const { Client,Events,IntentsBitField} = require('discord.js');
const { EndBehaviorType,joinVoiceChannel, createAudioPlayer ,createAudioResource} = require('@discordjs/voice');
const client = new Client({ intents:[IntentsBitField.Flags.GuildVoiceStates,IntentsBitField.Flags.Guilds,IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.DirectMessageTyping]} );
const {between} = require("./utils/random")
const {execAsync} = require("./utils/exec")

const token = process.env.TOKEN
const {opus} = require('prism-media')
const player = createAudioPlayer();

const gTTS = require('gtts');
client.once('ready', () => {
    console.log('Félicitations, votre bot Discord a été correctement initialisé !');
 });



 const fs = require('fs');

 const redo = async (message) => {
  if (message.member.voice.channel) {
    const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf:false
    })

    
    console.log()
    // Create a ReadableStream of s16le PCM audio
    const audio = connection.receiver.subscribe(message.member.id,{end: { 
        behavior: EndBehaviorType.AfterSilence, 
        duration: 1000
      }});

    audio.on("error", async (err) => { 
        console.log("error !!!")
        console.log(err)
    });

    

    audio.on("data", async (chunk) => { 
        console.log(chunk)
        console.log("data")

    });
    const filename = `${between(0,999999)}`
    const stream = fs.createWriteStream(`cache/${filename}`);
    const subscription = connection.subscribe(player);
    audio.on("end", async () => { 
        console.log("end")
        audio.unpipe(stream);
        stream.end()
        const time1 = Date.now()
        await execAsync(`sox -t raw -r 48000 -e signed -b 16 -c 2 cache\\${filename} -r 48000 ${filename}.wav | whisper ${filename}.wav --model small --language fr -f txt -o logs\\`)
        .then(async (transcript) => {
          const time2 = Date.now()
          console.log(`Transcript created in ${time2 - time1}ms : ${transcript}`)
          console.log(transcript.substring(transcript.indexOf("]")+1))
          let text = Buffer.from(transcript.substring(transcript.indexOf("]")+1), 'utf-8').toString()
          /*await execAsync(`py -m bark --history_prompt .\\fr_speaker_1.npz --output_filename "example.wav" --output_dir tobesaid --text "${text}" `)
          .then((transcript) => {
            const time2 = Date.now()
            console.log(`Transcript created in ${time2 - time1}ms : ${transcript}`)
            const resource = createAudioResource('tobesaid\\example.wav');
            player.play(resource);
          })
          .catch((error) => {
            console.log(error)
          })*/

          fs.readFile(`logs\\${filename}.txt`, 'utf8', async (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(data)
            const  gtts = new gTTS(data, 'fr');
            await gtts.save('tobesaid\\example.mp3', function (err, result){
            if(err) { throw new Error(err); }
            console.log("Text to speech converted!");
            const resource = createAudioResource('tobesaid\\example.mp3');
            player.play(resource);
            redo(message)
         });
          });

          
          

        })
        .catch((error) => {
          console.log(error)
        })

    });
    const decoder = new opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });
    audio.pipe(decoder).pipe(stream);
 }
}


 client.on('messageCreate', async message => {
    // On rejoint le même salon que la personne qui a envoyé le message
    if (message.member.voice.channel) {
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf:false
        })

        
        console.log()
        // Create a ReadableStream of s16le PCM audio
        const audio = connection.receiver.subscribe(message.member.id,{end: { 
            behavior: EndBehaviorType.AfterSilence, 
            duration: 1000
          }});

        audio.on("error", async (err) => { 
            console.log("error !!!")
            console.log(err)
        });

        

        audio.on("data", async (chunk) => { 
            console.log(chunk)
            console.log("data")

        });
        const filename = `${between(0,999999)}`
        const stream = fs.createWriteStream(`cache/${filename}`);
        const subscription = connection.subscribe(player);
        audio.on("end", async () => { 
            console.log("end")
            audio.unpipe(stream);
            stream.end()
            const time1 = Date.now()
            await execAsync(`sox -t raw -r 48000 -e signed -b 16 -c 2 cache\\${filename} -r 48000 ${filename}.wav | whisper ${filename}.wav --model small --language fr -f txt -o logs\\`)
            .then(async (transcript) => {
              const time2 = Date.now()
              console.log(`Transcript created in ${time2 - time1}ms : ${transcript}`)
              console.log(transcript.substring(transcript.indexOf("]")+1))
              let text = Buffer.from(transcript.substring(transcript.indexOf("]")+1), 'utf-8').toString()
              /*await execAsync(`py -m bark --history_prompt .\\fr_speaker_1.npz --output_filename "example.wav" --output_dir tobesaid --text "${text}" `)
              .then((transcript) => {
                const time2 = Date.now()
                console.log(`Transcript created in ${time2 - time1}ms : ${transcript}`)
                const resource = createAudioResource('tobesaid\\example.wav');
                player.play(resource);
              })
              .catch((error) => {
                console.log(error)
              })*/
              fs.readFile(`logs\\${filename}.txt`, 'utf8', async (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log(data)
                const  gtts = new gTTS(data, 'fr');
                await gtts.save('tobesaid\\example.mp3', function (err, result){
                if(err) { throw new Error(err); }
                console.log("Text to speech converted!");
                const resource = createAudioResource('tobesaid\\example.mp3');
                player.play(resource);
                redo(message)
             });
              });
              

            })
            .catch((error) => {
              console.log(error)
            })

        });
        const decoder = new opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });
        audio.pipe(decoder).pipe(stream);

        /*setTimeout(() => {
            console.log('Stop writing to file.txt.');
            audio.unpipe(stream);
            console.log('Manually close the file stream.');
            stream.end();
          }, 5000);*/

        

    // Créer un dispatcher
    /*const dispatcher = connection.play("music/audio.mp3")

    dispatcher.on("start", () => {
    console.log("audio.mp3 a commencé !")
    })

    dispatcher.on("finish", () => {
    console.log("audio.mp3 s'est terminé !")
    })

    // Gestion d'erreurs !
    dispatcher.on("error", console.error)

    dispatcher.destroy()*/
    }
  })
 
 client.login(token);