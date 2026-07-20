package com.movielab.model.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TmdbCastResponse {
    private String name;
    private String character;
    @JsonProperty("profile_path")
    private String profilePath;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCharacter() { return character; }
    public void setCharacter(String character) { this.character = character; }
    public String getProfilePath() { return profilePath; }
    public void setProfilePath(String profilePath) { this.profilePath = profilePath; }
}
