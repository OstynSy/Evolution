import { useColonyStore } from '../../store/colonyStore';

export function tickColony() {
  useColonyStore.getState().tickResources();
}
