/**
 * A generic identifier.
 *
 * Is an array of strings which represent an object accessor e.g. the value
 * ["a", "b"] represents obj["a"]["b"]. This identifier will be used to
 * access values from the persistent variable storage and for accessing
 * nested interactions.
 *
 * Validation of these identifiers will be performed by the editor.
 */
export type Identifier = string

/**
 * A unique identifier for a given interaction, which will be referred to by
 * e.g. options that initiate this interaction when selected.
 */
export type InteractionId = Identifier

/**
 * An identifier that points to a string key in the persistent variables.
 */
export type KeyId = Identifier

/**
 * An identifier that points to a boolean flag in the persistent variables.
 */
export type FlagId = Identifier

/**
 * An identifier that points to a numeric counter in the persistent variables.
 */
export type CounterId = Identifier

/**
 * An identifier that points to a numeric value in the persistent variables.
 */
export type ValueId = Identifier

/**
 * A batch of messages, used to reduce duplication of settings that would
 * have been applied to each of them individually.
 *
 * TODO Rename property 'messages' to 'text' or similar? Property messages
 * -> messages is duplicated in output
 */
export type MessageGroup = {
  messages: (string | SingleMessage | Conditional<string | SingleMessage>)[]
} & MessageSettings

/**
 * A single message that contains a single line of text. Can be by itself or
 * as part of a message group.
 *
 * @property text - The content of the message.
 * @property onDisplay - Actions to execute when this message appears.
 */
export type SingleMessage = {
  text: string | Conditional<string>
  onDisplay?: (Action | Conditional<Action>)[]
} & MessageSettings &
  MessageTimingControl

/**
 * Settings that can be applied either to a single message or to a group of
 * messages. If applied to a group of messages, it determines the default
 * value for each message, with the exception of displayIf and onDisplay
 * which are executed for the message group but do not affect the messages
 * it contains.
 *
 * @property speaker - The character who will be saying this message.
 * @property speakerModifier - Some modifier to apply to the message. Each
 * speaker is expected to have its own accepted set of modifiers.
 * @property displayIf - The message or group will be ignored unless these
 * conditions pass.
 * @property modifier - General modifiers that are not character-specific.
 * @property class - Straight-up just CSS class names to pass to the final
 * message. TODO Deprecate in favour of something implementation-agnostic
 */
export type MessageSettings = {
  speakerModifier?: string[]
  speaker?: string
  displayIf?: Condition[]
  modifier?: string[]
}

/**
 * Timing controls to be applied to a single message.
 *
 * @property delay - A delay in seconds to prepend to the message,
 * overriding any default delay.
 * @property duration - The time in seconds to wait before sending the
 * message, but after announcing that the message is going to be sent,
 * overriding any default duration or duration calculations.
 * @property durationMultiplier - A multiplier to be applied to the
 * duration, applied after any default calculations or multipliers.
 */
export type MessageTimingControl = {
  delay?: number
  duration?: number
  durationMultiplier?: number
}

/**
 * An option that appears and will be presented to the player when the
 * interaction is finished.
 *
 * @property text - The text of the option.
 * @property targetInteraction - An identifier pointing to the interaction
 * to jump to after selecting this option.
 * @property displayIf - This option will not appear unless these conditions
 * are met.
 * @property onSelect - Actions to take (other than starting the target
 * interaction) when this option is selected).
 * @property messages - Messages to send before initiating the target
 * interaction. This can be used to have the player character say things
 * relating to their choice. The default speaker is the player. Prefer
 * putting messages into their own interactions.
 * @property optionModifier - A modifier to be passed to the implementation.
 * TODO Where are option modifiers declared?
 */
export type Option = {
  text: string
  targetInteraction?: InteractionId | Conditional<InteractionId>
  displayIf?: Condition[]
  onSelect?: (Action | Conditional<Action>)[]
  messages?: (MessageGroup | Conditional<MessageGroup>)[]
  optionModifier?: string
}

/**
 * An instruction to do something.
 *
 * @property executeIf - Only perform this action if these conditions are met.
 * @property executeAfter - An amount of time to wait before executing this
 * action.
 */
export type Action = {
  executeIf?: Condition[]
  executeAfter?: Delay
  toggleFlag?: FlagId
  setFlagTo?: [FlagId, true | false]
  setCounterTo?: [CounterId, number]
  incrementCounter?: CounterId
  decrementCounter?: CounterId
  increaseCounterBy?: [CounterId, number]
  decreaseCounterBy?: [CounterId, number]
  setValueTo?: [ValueId, number]
  increaseValueBy?: [ValueId, number]
  decreaseValueBy?: [ValueId, number]
  multiplyValueBy?: [ValueId, number]
  divideValueBy?: [ValueId, number]
  setKeyTo?: [KeyId, string]
}

/**
 * A condition to be evaluated before something happens.
 *
 * Each condition contains several keys; if multiple keys are set on a
 * single condition, they are combined with OR. If multiple conditions are
 * passed to a single check, they are combined with AND.
 */
export type Condition = {
  assertFlag?: FlagId
  assertNotFlag?: FlagId
  assertCounterEqualTo?: [CounterId, number]
  assertCounterMoreThan?: [CounterId, number]
  assertCounterLessThan?: [CounterId, number]
  assertValueMoreThan?: [ValueId, number]
  assertValueLessThan?: [ValueId, number]
  assertKeyIs?: [KeyId, string]
  assertKeyIsNot?: [KeyId, string]
}

/**
 * A set of if/elif/else conditions that resolve to a single result.
 *
 * A Conditional must always resolve to a single result, so it must
 * always have 'if' and 'else' properties. There can be as many 'elif'
 * properties as needed, otherwise an empty array.
 *
 * This is as opposed to simple conditions that may appear in other types,
 * such as Action's executeIf, which may or may not resolve to a value in
 * which case the outcome is ignored.
 *
 * @property if - Produce this result if the condition passes.
 * @property elif - An array of conditions that are iterated in order.
 * @property else - Produce this result if none of the above conditions passed.
 */
export type Conditional<R extends CanBeConditional> = {
  if: {
    condition: Condition
    result: R
  }
  elif: {
    condition: Condition
    result: R
  }[]
  else: R
}

/**
 * Checks if an object of a type that is either known or a Conditional of
 * that known, is a Conditional.
 *
 * @param obj - The object to check.
 */
export function isConditional<T>(
  obj: T | Conditional<T>
): obj is Conditional<T> {
  return (
    typeof obj === "object" &&
    "if" in obj &&
    "condition" in obj.if &&
    "elif" in obj &&
    Array.isArray(obj.elif) &&
    "else" in obj
  )
}

/**
 * List of things that can be wrapped by Conditional.
 */
export type CanBeConditional =
  | string
  | SingleMessage
  | Action
  | InteractionId
  | MessageGroup

/**
 * A delay after which to execute an action.
 *
 * @property time - Whether to wait in 'human' time i.e. following the
 * in-game clock and the flow of time as experienced by human characters, or
 * in 'bot' time i.e. following the real-world clock and the flow of time as
 * experienced by AI characters.
 */
export type Delay = {
  seconds: number
  time: "human" | "bot"
}

/**
 * A single interaction containing messages and subsequent options to display.
 *
 * @property id - An ID for this interaction, which must be unique across
 * all interactions in this event (but does not need to be unique across
 * all interactions in the whole story.)
 * @property speaker - The default speaker for message in this interaction,
 * if it does not differ from the event's default speaker.
 * TODO Rename to defaultSpeaker
 * @property messages - A list of message groups to be shown when this
 * interaction appears, followed by its options (if any).
 * @property options - A list of options that will appear at the end of
 * this interaction.
 * @property fallbackTargetInteraction - After the conditions of all
 * options have been evaluated, if no options would appear, instead of the
 * event stopping here, this interaction begins instead.
 * @property onStart - An action to be executed before any messages are shown.
 * @property onEnd - An action to be executed after the options are shown.
 * @property onMessagesEnd - An action to be executed after the messages are
 * shown but before the options are shown.
 */
export type Interaction = {
  id: string
  speaker?: string
  // TODO Change 'messages' to 'messageGroups'
  messages: (MessageGroup | Conditional<MessageGroup>)[]
  options?: Option[]
  fallbackTargetInteraction?: InteractionId
  onStart?: (Action | Conditional<Action>)[]
  onMessagesEnd?: (Action | Conditional<Action>)[]
  onEnd?: (Action | Conditional<Action>)[]
}

/**
 * An event that contains a series of interactions.
 *
 * The interactions can be arbitrarily nested into sub-events.
 *
 * @property id - An ID for this event, which must be unique across all
 * events in the story.
 * @property summary - A short summary of the event to remind the writer
 * what it is.
 * @property defaultSpeaker - The default speaker for each interaction in
 * this event.
 * @property defaultOptionModifier - The default option modifier for each
 * option in each interaction in this event.
 * @property interactions - The interactions contained in this event. They
 * are supposed to link to and reference each other, but they don't have to.
 */
export type Event = {
  id: string
  summary: string
  defaultSpeaker?: string
  defaultOptionModifier?: string
  interactions: Interaction[]
}

/**
 * The main events object, which is the contents of the events file.
 *
 * @property _meta - Meta information about the events. The _convomap
 * property is required.
 * @property events - The list of events
 */
export type EventsRegistry = {
  _meta: {
    _convomap: string
  } & Record<string, unknown> // TODO
  events: Event[]
}
