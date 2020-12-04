class TresEnLinea {
  constructor(canvas){
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.coordinates = this.coordinates.bind(this);
    this.selectFigure();
    this.inicialize();
  }

  inicialize(){
    this.gameTitle = 'TresEnLinea';
    this.newGame = true;
    this.coordinatesExists = [];
    this.ThreeInLine = [];
    this.isMyTurn = true;
    this.lineWidth = 1;
    this.board();
    this.changeTurn();
    this.limits = {
      '100': 100,
      '200': 200,
      '300': 300
    }
  }

  messages({ text, icon, cancelText = '', catchText = ''}){
    swal({
      title: this.gameTitle,
      text: text,
      icon: icon,
      buttons: {
        cancel: cancelText,
        catch: {
          text: catchText,
          value: 'catch',
        },
      },
    })
    .then(value => {
      switch(value){
        case 'catch':
          window.location.reload();
          break;
        default:
          return false;
      }
    });
  }

  changeTurn(){
    if(this.isMyTurn){
      this.addEvent();
    } else {
      this.bot();
    }
  }

  whoWins(){
    if(this.coordinatesExists.length >= 3){
      const myAttemps = this.coordinatesExists.filter(position => position.figure === this.figures.myFigure);
      const botAttemps = this.coordinatesExists.filter(position => position.figure === this.figures.botFigure);
      this.evaluateWinner(myAttemps, 'You');
      this.evaluateWinner(botAttemps, 'Bot');
    }
  }

  evaluateWinner(attemps, player){
    if(!this.newGame){
      let lineCoordinates;

      for(let i = 0; i <= attemps.length - 1; i++){
        this.ThreeInLine.push(attemps[i]);
      }

      if(player === 'You'){
        this.isMyTurn = true;
      } else {
        this.isMyTurn = false;
      }

      const x = this.filterCoordinates(this.ThreeInLine, 'x');
      const y = this.filterCoordinates(this.ThreeInLine, 'y');
      const special = this.filterSpecialCoordinates(this.ThreeInLine);

      lineCoordinates = x.position ? x.line : y.position ? y.line : special.position ? special.line : [];

      if(x.position | y.position | special.position){
        this.line(...lineCoordinates);
        this.messages({
          text: `${player === 'You' ? 'Ganaste, eres increible!' : '[Bot dice] Ja! Te gané.'} \n ¿Quieres jugar de nuevo?`,
          icon: player === 'You' ? 'success' : 'warning',
          cancelText: 'Cancelar',
          catchText: 'Aceptar',
        });
        this.ThreeInLine = [];
        this.newGame = true;
        if(this.isMyTurn){
          clearTimeout(this.botTime);
        } else {
          this.removeEvent();
        }
      } else {
        this.ThreeInLine = [];
      }
    }
  }

  filterCoordinates(value, coordinate){
    let line;

    const position_100 = value.filter(position => position[coordinate] === this.limits['100']).length === 3;
    const position_200 = value.filter(position => position[coordinate] === this.limits['200']).length === 3;
    const position_300 = value.filter(position => position[coordinate] === this.limits['300']).length === 3;

    if(position_100 && coordinate === 'x'){
      line = [50, 0, 50, 300];
    } else if(position_200 && coordinate === 'x'){
      line = [150, 0, 150, 300];
    } else if(position_300 && coordinate === 'x'){
      line = [250, 0, 250, 300];
    } else if(position_100 && coordinate === 'y'){
      line = [0, 50, 300, 50];
    } else if(position_200 && coordinate === 'y'){
      line = [0, 150, 300, 150];
    } else if(position_300 && coordinate === 'y'){
      line = [0, 250, 300, 250];
    }

    return {
      position: position_100 || position_200 || position_300,
      line,
    };
  }

  filterSpecialCoordinates(value){
    let line;
    const special_1 = value.filter(position => position.x === position.y).length === 3;

    const special_2 = value.some(position => position.x === this.limits['300'] && position.y === this.limits['100']);
    const special_3 = value.some(position => position.x === this.limits['200'] && position.y === this.limits['200']);
    const special_4 = value.some(position => position.x === this.limits['100'] && position.y === this.limits['300']);

    if(special_1){
      line = [0, 0, 300, 300];
    } else if(special_2 && special_3 && special_4){
      line = [300, 0, 0, 300];
    }

    return {
      position: special_1 || (special_2 && special_3 && special_4),
      line,
    };
  }

  selectFigure(){
    swal({
      title: 'TresEnLinea',
      text: `¿Con qué figura quieres jugar?`,
      buttons: {
        cross:{ text: 'X' },
        circle: { text: 'O' },
      }
    })
    .then(value => {
      let option;
      let botOption;

      switch(value){
        case 'cross':
          option = 1;
          botOption = 2;
          break;
        case 'circle':
          option = 2;
          botOption = 1;
          break;
        default:
          this.messages({
            text: '¡Vaya!, no conozco esa figura, intentalo de nuevo 🤔',
            icon: 'warning',
            cancelText: 'Cancelar',
            catchText: 'Empezar de nuevo',
          });
      }

      this.figures = {
        myFigure: option,
        botFigure: botOption,
      }
    });
  }

  board(){
    for(let i = 1; i < 3; i++){
      let linePosition = 100 * i;
      this.line(linePosition, 0, linePosition, 300);
      this.line(0, linePosition, 300, linePosition);
    }
  }

  addEvent(){
    this.canvas.addEventListener('click', this.coordinates);
  }

  removeEvent(){
    this.canvas.removeEventListener('click', this.coordinates);
  }

  bot(){
    const x = this.randomNumber(1, 3) * 100;
    const y = this.randomNumber(1, 3) * 100;

    this.removeEvent();

    let sn = this.evaluateCoordinatesExists(x, y);

    if(sn){
      this.botTime = setTimeout(() => {
        this.putFigure(x, y);
      }, 300);

      this.coordinatesExists.push({x: x, y: y, figure: this.figures.botFigure});
    }
  }

  evaluateCoordinatesExists(x, y){
    if(this.newGame){
      this.newGame = false;
      return true;
    } else {
      if(this.coordinatesExists.length <= 8){
        for(let position of this.coordinatesExists){
          if(x === position.x && y === position.y){
            if(this.isMyTurn){
              swal({
                title: this.gameTitle,
                text: 'Oh vaya! Esa posición esta ocupada, intenta en otra 😉',
                icon: 'error',
                button: {
                  text: 'Aceptar',
                },
              });
              return false;
            } else {
              // console.log('[Bot] posicion ocupada');
              this.bot();
              return false;
            }
          }
        }

        return true;
      } else {
        setTimeout(() => {
          if(!this.newGame){
            this.messages({
              text: 'Jejeje, parece que ninguno ganó, ¿que tal otra partida? 😅',
              icon: 'error',
              cancelText: 'Cancelar',
              catchText: 'Aceptar',
            });
          }
        }, 500);
      }
    }
  }

  coordinates(e){
    let x = e.offsetX;
    let y = e.offsetY;
    let positionX = this.evaluateCoordinates(x);
    let positionY = this.evaluateCoordinates(y);

    let sn = this.evaluateCoordinatesExists(positionX, positionY);

    if(sn){
      this.coordinatesExists.push({x: positionX, y: positionY, figure: this.figures.myFigure});
      this.putFigure(positionX, positionY);
      this.whoWins();
    }
  }

  evaluateCoordinates(value){
    for(let i in this.limits){
      if(value <= this.limits[i]-5){
        return this.limits[i];
      }
    }
  }

  putFigure(x, y){
    let figure = 0;

    if(this.isMyTurn){
      figure = this.figures.myFigure;
      this.isMyTurn = false;
    } else {
      figure = this.figures.botFigure;
      this.isMyTurn = true;
    }

    if(figure === 1){
      this.cross(x, y);

    } else if(figure === 2){
      this.circle(x, y);
    }

    if(!this.newGame){
      this.changeTurn();
    }
  }

  randomNumber(min, max){
    let result = Math.floor(Math.random() * (max - min + 1)) + min;
    return result;
  }

  cross(x, y){
    this.line(x-90, y-90, x-10, y-10);
    this.line(x-10, y-90, x-90, y-10);
  }

  circle(x, y){
    this.context.beginPath();
    this.context.arc(x-50, y-50, 40, 0, Math.PI * 2);
    this.context.stroke();
  }

  line(xi, yi, xf, yf){
    this.context.lineWidth = this.lineWidth;
    this.context.beginPath();
    this.context.lineTo(xi, yi);
    this.context.lineTo(xf, yf);
    this.context.closePath();
    this.context.stroke();
  }
}