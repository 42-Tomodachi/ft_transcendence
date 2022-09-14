import { EventEmitter } from 'stream';
import { clearInterval, setInterval } from 'timers';
import { Player } from './game.class.Player';

class QueueInfo {
  player: Player;
  gentime: number;
  priority: number;
  picked: boolean;

  constructor(player: Player) {
    this.player = player;
    this.gentime = new Date().getTime();
    this.priority = 0;
    this.picked = false;
  }
}

export class GameQueue {
  name: string;
  queue: QueueInfo[];
  eventObject: EventEmitter;
  matching: NodeJS.Timer;

  constructor(name: string, eventObj: EventEmitter) {
    this.name = name;
    this.queue = [];
    this.eventObject = eventObj;

    this.eventObject.on(`${name}`, this.pickMatchup);
  }

  enlist(player: Player): number {
    const item = new QueueInfo(player);
    if (this.lookFor(player)) return this.queue.length;

    const length = this.queue.push(item);
    this.switchMatchMaker();
    return length;
  }

  lookFor(player: Player): QueueInfo {
    const item = this.queue.find((queue) => {
      return queue.player === player;
    });
    return item;
  }

  remove(player: Player): boolean {
    const queueItem = this.lookFor(player);
    const index = this.queue.indexOf(queueItem);

    if (index === -1) return false;

    this.queue.splice(index, 1);
    this.switchMatchMaker();
    return true;
  }

  switchMatchMaker(): void {
    if (this.matching) {
      if (this.queue.length < 2) {
        clearInterval(this.matching);
        this.matching = null;
        console.log('switchMatchMaker: matching off');
      }
      return;
    }
    if (this.queue.length >= 2) {
      this.matching = setInterval(() => {
        this.pickMatchup();
      }, 100);
    }
    console.log('switchMatchMaker: matching on');
  }

  matchAlgorithm(players: Player[]): boolean {
    const inittime = new Date().getTime();
    if (this.queue.length < 2) return false;

    players.push(this.queue.shift().player);
    players.push(this.queue.shift().player);
    return true;
  }

  pickMatchup(): void {
    const inittime = new Date().getTime();
    const players: Player[] = [];
    let matched = this.matchAlgorithm(players);

    while (new Date().getTime() - inittime < 100 && matched === true) {
      this.eventObject.emit(
        'makeLadderMatch',
        players[0],
        players[1],
        'normal',
      );
      console.log(`ladderMatching: ${players}`);

      matched = this.matchAlgorithm(players);
    }

    this.switchMatchMaker();
  }
}
