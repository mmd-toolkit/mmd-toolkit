/**
 * Thrown when mermaid fails because Node lacks something a browser has, or
 * when the site configuration is one that a summary cannot be made under, as
 * opposed to rejecting the input. Such a failure says nothing about the input,
 * so it must never be recorded as a rejection.
 */
export class MermaidEnvironmentError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "MermaidEnvironmentError"
  }
}
