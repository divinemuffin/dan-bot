interface ITelegramMessage {
    message_id: number,
    from: {
      id: number,
      is_bot: boolean,
      first_name: string,
      username: string,
      language_code: string
    },
    chat: {
      id: number,
      first_name: string,
      username: string,
      type: string
    },
    date: number,
    text: string,
    entities: [{ 
        offset: number, 
        length: number, 
        type: string 
    }]
};

interface ITelegramUpdateResponse {
  update_id: number,
  message: ITelegramMessage
}



export {
    ITelegramMessage,
    ITelegramUpdateResponse
}