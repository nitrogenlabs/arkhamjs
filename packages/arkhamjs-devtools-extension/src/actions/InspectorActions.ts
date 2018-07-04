import {FluxAction} from '@nlabs/arkhamjs';
import {createBrowserHistory, History} from 'history';

export class InspectorActions {
  static dispatch(action: FluxAction): void {
    this.message({
      _arkhamCall: {
        args: [action],
        method: 'dispatch'
      }
    });
  }

  static goto(routePath: string): History {
    const history = createBrowserHistory();
    history.push(`/${routePath}`);
    return history;
  }

  static onDispatch(data): void {
    const {action, duration, state, stack} = data;
    const formatDuration: string = InspectorActions.msToTime(duration);
    console.log('InspectorActions::action', action);
    console.log('InspectorActions::state', state);
    console.log('InspectorActions::stack', stack);
    console.log('InspectorActions::formatDuration', formatDuration);
  }

  static onInfo(data): void {
    console.log('InspectorActions::onInfo::data', data);
  }

  static message(data): void {
    window.postMessage(data, '*');
  }

  static msToTime(duration: number): string {
    const milliseconds: number = Math.floor(duration % 1000);
    const seconds: number = Math.floor((duration / 1000) % 60);
    const minutes: number = Math.floor((duration / (1000 * 60)) % 60);
    const hours: number = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const formatHours: string = (hours < 10) ? `0${hours}` : hours.toString();
    const formatMinutes: string = (minutes < 10) ? `0${minutes}` : minutes.toString();
    const formatSeconds: string = (seconds < 10) ? `0${seconds}` : seconds.toString();

    return `${formatHours}:${formatMinutes}:${formatSeconds}.${milliseconds.toString()}`;
  }
}
