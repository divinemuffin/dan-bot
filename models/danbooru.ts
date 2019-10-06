/*
    * GENERAL NOTION
    * - naming interfaces with I prefix
    * - naming types with T prefix
    * - naming enum with E prefix
*/

export interface IDanPost {
    id: number,
    created_at: string,
    score: number,
    source: string,
    rating: string,
    image_width: number,
    image_height: number,
    tag_string: string,
    md5: string,
    file_ext: string,
    parent_id: number,
    has_children: boolean,
    tag_count_general: number,
    tag_count_artist: number,
    tag_count_character: number,
    tag_count_copyright: number,
    file_size: number,
    up_score: number,
    down_score: number,
    tag_count: number,
    updated_at: string,
    is_banned: boolean,
    has_active_children: boolean,
    uploader_name: string,
    has_large: boolean,
    children_ids: any,
    tag_string_general: string,
    tag_string_character: string,
    tag_string_copyright: string,
    tag_string_artist: string,
    tag_string_meta: string,
    file_url: string,
    large_file_url: string,
    preview_file_url: string
}

export interface IDanPostError {
    success: boolean,
    message: string
}

export type TDanRatings = 'explicit' | 'safe' | 'questionable';

export type TDanOrder = 'rank' | 'custom' | 'comment_bumped';
