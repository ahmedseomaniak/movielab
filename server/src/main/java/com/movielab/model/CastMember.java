package com.movielab.model;

public class CastMember {
    private String name;
    private String character;
    private String profileUrl;

    public CastMember(String name, String character, String profileUrl) {
        this.name = name;
        this.character = character;
        this.profileUrl = profileUrl;
    }

    public String getName() { return name; }
    public String getCharacter() { return character; }
    public String getProfileUrl() { return profileUrl; }
}
