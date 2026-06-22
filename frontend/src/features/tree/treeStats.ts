import type { ContenitoreNodeDto, OrganizzazioneTreeDto, TreeStats } from '../../types/tree'

function countContainers(nodes: ContenitoreNodeDto[], depth = 0): TreeStats {
  let containers = 0
  let equipments = 0
  let maxDepth = depth

  for (const n of nodes) {
    containers += 1
    equipments += n.apparecchiature.length
    const child = countContainers(n.sottoContenitori, depth + 1)
    equipments += child.equipments
    containers += child.containers
    maxDepth = Math.max(maxDepth, child.depth)
  }

  return { containers, equipments, depth: maxDepth }
}

export function computeTreeStats(tree: OrganizzazioneTreeDto): TreeStats {
  const rootEquipments = tree.apparecchiature?.length ?? 0
  const nested = countContainers(tree.contenitori ?? [], 1)
  return {
    containers: nested.containers,
    equipments: rootEquipments + nested.equipments,
    depth: Math.max(1, nested.depth),
  }
}
