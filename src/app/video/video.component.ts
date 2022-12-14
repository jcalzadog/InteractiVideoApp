import { Component, OnDestroy, OnInit } from '@angular/core';
import videojs from 'video.js';
import * as actions from '../../assets/do.json';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit, OnDestroy {
  player?: videojs.Player;
  tiempo: number = 0;

  constructor() { }

  // Instantiate a Video.js player OnInit
  ngOnInit(): void {
    this.player = videojs('video', {
      sources: [
        {
          src: 'assets/vid.mp4',
          type: 'video/mp4',
        },
      ],
    });

    let actionsString = JSON.stringify(actions) //JS value to json string
    let actionsJSON = JSON.parse(actionsString) //JSON string to JSON

    //Para Modales que duren unos Segundos
    let cerrarModal = false;
    let iniModalTime = 0;
    let modal: any;
    let timeout = 4; // variable para poder meter luego dentro de la modal el tiempo
    this.player.on('timeupdate', () => {
      var nuevoTiempoStr = this.player?.currentTime().toString().split(".")[0];
      var nuevoTiempo = parseInt(nuevoTiempoStr!);//la exclamacion es necesaria porque si no ts te dice que como puede ser nulo no lo acepta, con eso "fuerzas" a ts a pensar que siempre tendra contenido (que si lo va a tener porque esta dentro del objeto player... como para no tenerlo)

      //Para controlar que no se repita los modales y puedan reutilizarse
      if (nuevoTiempo != this.tiempo) {
        this.tiempo = nuevoTiempo;

        //Como cambiamos de segundo comprobamos si hay que cerrar algun modal (el 4 para que dure abierto 4 segundos)
        // Para DIALOG, COrrecto de multi y Jump
        if (cerrarModal && ((this.tiempo - iniModalTime) == timeout)) {
          modal.close();
          cerrarModal = false;
        }

        //Bucle para Recorrer los Tiempos del JSON
        for (let tiempos in actionsJSON) {

          //Si tiempo de video es >= que el del JSON y <= que JSON+0.1 Hace accion
          if (((this.tiempo ? this.tiempo : -1) >= Number(tiempos)) && ((this.tiempo ? this.tiempo : -1) <= (Number(tiempos) + 0.1))) {
            console.log("Entra en Marca de tiempo:" + tiempos + " con tiempo actual:" + this.tiempo);

            //Obtenemos datos de cada franja de Tiempo
            let value = actionsJSON[tiempos];

            //ESTO POSIBLE EXPORTAR A UN METODO QUE TE LO HAGA PARA ASI EN LA MULTI REUTILIZAR Y NO TENER CODIGO REPETIDO
            switch (value["type"]) {
              case "dialog": {
                var contDialog = document.createElement('p');
                contDialog.innerHTML = value["message"];
                if (value["timeout"]){
                  timeout = parseInt(value["timeout"]);
                }else {
                  timeout = 4;
                }
                
                modal = this.player?.createModal(contDialog, {});
                modal.addClass('vjs-my-fancy-modal');
                this.player?.play();
                //Para cerrar luego el modal
                cerrarModal = true;
                iniModalTime = this.tiempo;
                break;
              }
              case "dialog-jump": {
                const contentJump = document.createElement('div');
                contentJump.innerHTML = `<div> <button class="btn btn-primary" id="jump">` + value["message"] + `</button></div>`
                modal = this.player?.createModal(contentJump, {});
                modal.addClass('vjs-my-fancy-modal');
                this.player?.play();
                //Para cerrar luego el modal
                cerrarModal = true;
                iniModalTime = this.tiempo;
                timeout = 4;

                let btnJump = document.getElementById("jump");
                btnJump!.onclick = (e) => {
                  this.player?.currentTime(value["jump"]);
                  modal.close();
                  this.player?.play();
                }
                break;
              }
              case "dialog-link": {
                const contentLink = document.createElement('div');
                contentLink.innerHTML = `<div>` + value["message"] + `</div>`
                modal = this.player?.createModal(contentLink, {});
                modal.addClass('vjs-my-fancy-modal');
                break;
              }
              case "multi": {
                //Creamos un div con la pregunta y por cada opcion pues un boton
                const contentMulti = document.createElement('div');
                let htmlMulti = `<div> <p> ` + value["question"] + ` </p>`;
                for (let opcion in value["options"]) {
                  htmlMulti = htmlMulti + `<button class="btn btn-primary" id="` + "O" + opcion + `" > ` + value["options"][opcion] + `</button>`;
                }
                htmlMulti = htmlMulti + `</div>`;
                contentMulti.innerHTML = htmlMulti;
                modal = this.player?.createModal(contentMulti, {});
                modal.addClass('vjs-my-fancy-modal');
                //Ahora obteremos cada boton y le añadimos su respectiva accion
                //AQUI PODRIAMOS REUTILIZAR EL METODO QUE DEPENDEN DEL TIPO HAGA UNA COSA U OTRA
                for (let opcion in value["options"]) {
                  let btnTemp = document.getElementById("O" + opcion);
                  btnTemp!.onclick = (e) => {
                    if (value["actions"][opcion] == "dialog") {
                      modal.close();
                      modal = this.player?.createModal(value["params"][opcion], {});
                      this.player?.play();
                      //Para cerrar luego el modal
                      cerrarModal = true;
                      iniModalTime = this.tiempo;

                    } else if (value["actions"][opcion] == "dialog-jump") {
                      modal.close();
                      this.player?.currentTime(value["params"][opcion][1]);
                      modal = this.player?.createModal(value["params"][opcion][0], {});
                      modal.addClass('vjs-my-fancy-modal');
                    } else if (value["actions"][opcion] == "jump") {
                      this.player?.currentTime(value["params"][opcion]);
                      modal.close();
                      this.player?.play();
                    }

                  }
                }
                break;
              }
              default: {
                //Nada
                break;
              }
            }

            // When the modal closes, resume playback.
            modal?.on('modalclose', () => {
              this.player?.play();
            });
          }
        }
      }
    });

  }

  // Dispose the player OnDestroy
  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }
}
