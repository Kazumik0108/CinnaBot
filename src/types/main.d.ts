declare module 'is-image-url' {
  export default function isImageUrl(a: string): boolean;
}

declare module 'twit' {
  export interface Stream {
    reqOpts: {
      form: {
        follow: string;
      };
    };
  }

  export interface Tweet {
    retweeted_status: boolean;
    quoted_status: boolean;
    user: {
      screen_name: string;
    };
    id_str: string;
  }
}
