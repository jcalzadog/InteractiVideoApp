import { Component, OnDestroy, OnInit } from '@angular/core';
import videojs from 'video.js';
import * as actions from 'src/assets/do.json' ;
import { keyframes } from '@angular/animations';
@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit, OnDestroy {
  player?: videojs.Player;
  constructor() {}
  tiempo:number=0;
  // Instantiate a Video.js player OnInit
  metodo(tiempo:number){
    this.player?.currentTime(tiempo);
    console.log("Runea")
  }
  ngOnInit(): void {
    this.player = videojs('video', {
      sources: [
        {
          //src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          src:'assets/vid.mp4',
          type: 'video/mp4',
        },
      ],
    });
/*
    this.player.on('pause', () => {
      //A partir de aqui o usamos lo de abajo o creamos un modal personalizado con seleccion multiple por ejemplo
      /*
        const contentEL = document.createElement('div');
        AQUI IRIA UN HTML QUE SOLO TIENE UN DIV CON UNA SELECCION MULTIPLE
        contentEL.innerHTML='
          <div> .............. </div>'
        Y YA ABAJO SE USA 
        const modal = this.player?.createModal(contentEL, {});
      *//*
      const modal = this.player?.createModal('This is a modal!', {});

      // When the modal closes, resume playback.
      modal?.on('modalclose', () => {
        this.player?.play();
      });
    });*/
    this.player.on('timeupdate', () => {
      var nuevoTiempoStr = this.player?.currentTime().toString().split(".")[0];
      var nuevoTiempo = parseInt(nuevoTiempoStr!);//la exclamacion es necesaria porque si no ts te dice que como puede ser nulo no lo acepta, con eso "fuerzas" a ts a pensar que siempre tendra contenido (que si lo va a tener porque esta dentro del objeto player... como para no tenerlo)
      if (nuevoTiempo != this.tiempo){
        this.tiempo=nuevoTiempo;
        if(this.tiempo==10){
        const contentEL = document.createElement('div');
        //AQUI IRIA UN HTML QUE SOLO TIENE UN DIV CON UNA SELECCION MULTIPLE
        contentEL.innerHTML=`<div> Has perdido el juego MUAHAHAHAH <button id="btnPrueba">Prueba</button> </div>`;
        
        const modal = this.player?.createModal(contentEL, {});
        var btnPrueba = document.getElementById("btnPrueba");
        btnPrueba!.onclick = (e) => {
          this.player?.currentTime(1);
          modal?.close();
          this.player?.play();
          
        }
      // When the modal closes, resume playback.
      modal?.on('modalclose', () => {
        this.player?.play();
      });
      }}
    });
  }

 

  // Dispose the player OnDestroy
  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }
}
