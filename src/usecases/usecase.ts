export interface Usecase<InputDTO, OutputDTO> {
  execute(input: InputDTO): Promise<OutputDTO>;
}
