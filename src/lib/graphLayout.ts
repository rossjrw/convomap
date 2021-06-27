/* eslint-disable @typescript-eslint/no-non-null-assertion */

import ELK, { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk.bundled"
import { Interaction } from "types"
import { getOptionId } from "./identifier"

type Point = { x: number; y: number }
type Dimensions = { height: number; width: number }
export type Edge = Point[]
type Node = Point & Dimensions & { id: string }
export type GraphLayout = Dimensions & { edges: Edge[]; nodes: Node[] }

/**
 * Creates a directed graph to visually represent an interaction tree.
 *
 * @param interactions - The list of interactions to render.
 */
export async function createInteractionGraph(
  interactions: Interaction[]
): Promise<GraphLayout> {
  const elk = new ELK()

  const elkChildren: ElkNode[] = []
  const elkEdges: { source: string; target: string }[] = []

  // Iterate through interactions to render them
  interactions.forEach((interaction) => {
    // Just use a default width and height for now
    // TODO Get width and height from HTML
    elkChildren.push({ id: interaction.id, width: 300, height: 300 })
    if (interaction.fallbackTargetInteraction) {
      // Connect this interaction and its fallback, if any
      elkEdges.push({
        source: interaction.id,
        target: interaction.fallbackTargetInteraction,
      })
    }
    // Also iterate the options
    interaction.options?.forEach((option) => {
      const optionId = getOptionId(interaction, option)
      elkChildren.push({ id: optionId, width: 300, height: 100 })
      // Connect this option and its parent interaction
      elkEdges.push({ source: interaction.id, target: optionId })
      // Connect this option and its target interaction
      // The target interaction can be Conditional, which must be resolved
      // TODO Resolve conditional target interaction
      if (typeof option.targetInteraction === "string") {
        elkEdges.push({ source: optionId, target: option.targetInteraction })
      }
    })
  })

  // Generate the graph
  const graph = await elk.layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    },
    children: elkChildren,
    edges: elkEdges.map((edge, index) => {
      return {
        id: `e${index}`,
        sources: [edge.source],
        targets: [edge.target],
      }
    }),
  })

  console.log(graph)

  // Extract nodes
  const nodes = graph.children!.map((node) => {
    // The coords of each node are at their centre, but for CSS positioning
    // I want the coords of the top-right corner
    return {
      id: node.id,
      // x: node.x! - node.width! / 2,
      // y: node.y! - node.height! / 2,
      x: node.x!,
      y: node.y!,
      height: node.height!,
      width: node.width!,
    }
  })

  // Extract edges
  const edges = (<ElkExtendedEdge[]>graph.edges).map((edge) => {
    const section = edge.sections[0]
    return [section.startPoint, ...(section.bendPoints ?? []), section.endPoint]
  })

  // Extract the graph itself
  const height = graph.height!
  const width = graph.width!

  return {
    height,
    width,
    edges,
    nodes,
  }
}

/**
 * Represents a point as numeric coords joined with a comma.
 *
 * @param point - The point to transform.
 */
export function pointToCoords(point: Point): string {
  return `${point.x}, ${point.y}`
}
