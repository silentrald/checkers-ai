// Referred from http://albionalumni.org/chevrons/cck/chk.html#1115
const SWITCHER_OPENING = {
  '17-13': {
    '7-10': {},
  },
  '17-14': {},
  '22-18': {
    '7-10': {},
  },
  '25-21': {
    '8-11': {},
  },
  // ?
  '26-23': {},
  '27-23': {
    '8-12': {},
  },
  '27-24': {
    '7-10': {},
  },
};

const DYKE_OPENING = {
  '17-13': {
    '7-10': {},
  },
  '17-14': {}, // winning
  '25-22': {
    '8-11': {},
  },
  '26-22': {
    '7-10': {},
  },
  '26-23': {
    '19x23': {
      '30x23': {
        '8-11': {}, // winning
      },
      '31x22': {
        '7-10': {}, // winning
      },
    },
  },
  '27-23': {
    '8-12': {},
  },
  '27-24': {
    '7-10': {},
  },
};

const SINGLE_CORNER_OPENING_25x18 = {
  '12-16': {
    '18-14': {
      '10x17': {
        '21x14': {
          '9x18': {
            '23x14': {
              '6-10': {},
            },
          },
        },
      },
      '9x18': {
        '23x14': {
          '10x17': {
            '21x14': {
              '6-10': {},
            },
          },
        },
      },
    },
    '18-15': {
      '10x19': {
        '24x15': {
          '7-11': {},
        },
      },
    },
    '21-17': {
      '9-14': {
        '18-14': {
          '5x14x21': {}, // winning
        },
      },
    },
    '23-19': {
      '16x23': {
        '26x19': {
          '9-14': {
            '18x9': {
              '5x14': {}, // winning
            },
          },
        },
      },
    },
    '24-19': {
      '16-20': {},
    },
    '24-20': {
      '9-13': {
        '20x11': {
          '8x15x22': {}, // force moves & winning
        },
      },
    },
    '26-22': {
      '16-20': {},
    },
    '29-25': {
      '9-13': {},
    },
    '30-25': {
      '10-14': {}, // winning
    },
  },
};

const SINGLE_CORNER_OPENING_26x17 = {
  '8-11': {
    '17-13': {
      '9-14': {},
    },
    '17-14': {
      '9x18': {
        '23x14': {
          '10x17': {
            '21x14': {
              '6-9': {}, // winning
            },
          },
        },
      },
      '10x17': {
        '21x14': {
          '9x18': {
            '23x14': {
              '6-9': {}, // winning
            },
          },
        },
      },
    },
    '23-18': {
      '10-15': {},
    },
    '23-19': {
      '9-13': {},
    },
    '24-19': {
      '4-8': {}, // winning
    },
    '24-20': {
      '11-15': {}, // winning
    },
    '25-22': {
      '9-13': {}, // winning
    },
    '30-26': {
      '9-14': {}, // winning
    },
    '31-26': {
      '9-13': {}, // winning
    },
  },
};

const CROSS_OPENING = {
  '18-14': {
    '9x18': {
      '32x15': {
        '8-11': {},
      },
    },
  },
  '18-15': {
    '9-14': {},
  },
  '21-17': {
    '12-16': {},
  },
  '22-17': {
    '8-11': {},
  },
  '26-23': {
    '19x26': {
      '30x23': {
        '7-10': {},
      },
    },
  },
  '27-23': {
    '7-10': {}, // force captures
  },
  '27-24': {
    '7-10': {}, // force captures
  },
};

const CLASSIC_OPENING_23_19 = {
  '8-11': {
    '19-16': {
      '11x20': {}, // winning
    },
    '21-17': {
      '9-13': {}, // winning
    },
    '22-17': {
      '9-14': {}, // winning
    },
    '22-18': {
      '15x22': {
        '25x18': {
          '4-8': {},
        },
        '26x17': {
          '11x16': {}, // winning
        },
      },
    },
    '24-20': {
      '15x24': {
        '28x19': {
          '11-15': { // winning for other moves not listed
            '27-24': {
              '4-8': {}, // winning
            },
            '32-28': {
              '15x24': {
                '28x19': {
                  '7x11': {}, // winning
                },
              },
            },
            '19-16': {}, // force jump and winning
          },
        },
      },
    },
    '26-23': {
      '4-8': {},
    },
    '27-23': {
      '9-13': {},
    },
  },
};

const WEAK_OPENING_27x20 = {
  '21-17': {
    '9-14': {}, // winning
  },
  '22-17': {
    '10-15': {}, // winning
  },
  '22-18': {
    '10-15': {},
  },
  '23-18': {
    '10-15': {},
  },
  '23-19': {
    '9-14': {},
  },
  '28-24': {
    '11-15': {},
  },
  '31-27': {
    '9-14': {},
  },
  '32-27': {
    '9-14': {},
  },
};

const WEAK_OPENING_28x19 = {
  '19-15': {
    '10x19': {}, // winning
  },
  '19-16': {
    '12x19': {}, // winning
  },
  '21-17': {
    '10-15': {
      '7x14x21': {}, // winning
    },
  },
  '22-17': {
    '11-15': {},
  },
  '22-18': {
    '11-16': {},
  },
  '23-18': {
    '11-16': {},
  },
  '27-24': {
    '11-16': {},
  },
  '32-28': {
    '11-16': {},
  },
};

const WEAK_OPENING_22x15 = {
  '20-16': {
    '8-12': {}, // winning
  },
  '21-17': {
    '9-13': {},
  },
  '25-22': {
    '8-11': {},
  },
  '26-22': {
    '6-10': {},
  },
  '26-23': {
    '19x26': {
      '30x23': {
        '8-11': {},
      },
      '31x22': {
        '9-14': {}, // wins
      },
    },
  },
  '27-23': {
    '8-12': {},
  },
  '27-24': {
    '7-10': {},
  },
};

const WEAK_OPENING_23x14 = {
  '20-16': {
    '8-11': {}, // winning
  },
  '21-17': {
    '5-9': {}, // winning
  },
  '25-22': {
    '5-9': {},
  },
  '26-22': {
    '6-9': {},
  },
  '26-23': {
    '19x26': {
      '30x23': {
        '8-11': {},
      },
      '31-22': {
        '6-10': {}, // winning
      },
    },
  },
  '27-23': {
    '8-11': {},
  },
  '27-24': {
    '7-10': {},
  },
};

export const AI_FIRST_OPENING = { // AI is first try for first three moves
  '11-15': {
    // Best Replies
    '22-18': { // Single Corner
      '15x22': {
        '25x18': SINGLE_CORNER_OPENING_25x18,
        '26x17': SINGLE_CORNER_OPENING_26x17,
      },
    },
    '23-19': CLASSIC_OPENING_23_19,
    '23-18': { // Cross
      '15-19': {
        '24x15': {
          '10x19': CROSS_OPENING,
        },
      },
      '8-11': {},
    },
    // Adequate Replies
    '22-17': {
      '15-19': { // Dyke
        '23x16': {
          '12x19': {
            '24x15': {
              '10x19': DYKE_OPENING,
            },
          },
        },
        '24x15': {
          '10x19': {
            '23x16': {
              '12x19': DYKE_OPENING,
            },
          },
        },
      },
    },
    // Inferior Replies
    '24-20': {
      '15-18': {
        '22x15': {
          '10x19': {
            '23x16': {
              '12x19': WEAK_OPENING_22x15,
            },
          },
        },
        '23x14': {
          '9x18': {
            '22x15': {
              '10x19': WEAK_OPENING_23x14,
            },
          },
        },
      },
    },
    '24-19': {
      '11-15': {
        '24-19': {
          '15x24': {
            '27x20': {
              '8-11': WEAK_OPENING_27x20,
            },
            '28x19': {
              '8-11': WEAK_OPENING_28x19,
            },
          },
        },
      },
    },
    '21-17': {
      '9-13': {},
      '15-19': {
        '23x16': {
          '12x19': {
            '24x15': {
              '10x19': SWITCHER_OPENING,
            },
          },
        },
        '24x15': {
          '10x19': {
            '23x16': {
              '12x19': SWITCHER_OPENING,
            },
          },
        },
      },
    },
  },
};

const EDINBURGH_OPENING = {
  '5-9': {
    '18-15': {
      '10x19': {
        '24x15': {}, // winning
      },
      '11x18': {}, // winning
    },
  },
  '6-9': {
    '18-14': {},
  },
  '10-14': {
    '18x9': {
      '5x14': {
        '26-22': {},
      },
    },
  },
  '10-15': {
    '25-22': {},
  },
  '11-15': {
    '18x11': {
      '7x16': {
        '25-22': {}, // winning
      },
      '8x15': {
        '21-17': {
          '13x22': {
            '25x18x11': {
              '7x16': {
                '24x20': {},
              },
            },
          },
        },
      },
    },
  },
  '11-16': {
    '18-14': {},
  },
  '12-16': {
    '24-20': {},
  },
  '13-17': {
    '21x14': {
      '10x17': {
        '25-21': {},
      },
    },
  },
};

const DOUBLE_CORNER_OPENING = {
  '5-9': {
    '25-22': {},
  },
  '6-9': {
    '25-22': {},
  },
  '10-15': {
    '18x9': {
      '15x14': {
        '25-22': {},
      },
      '6x13': {
        '25-22': {},
      },
    },
  },
  '11-15': {
    '18x9': {
      '15x14': {
        '25-22': {},
      },
      '6x13': {
        '25-22': {}, // winning
      },
    },
  },
  '11-16': {
    '18x9': {
      '15x14': {
        '24-19': {},
      },
      '6x13': {
        '25-22': {}, // winning
      },
    },
  },
  '12-16': {
    '18x9': {
      '15x14': {
        '23-18': {}, // winning
      },
      '6x13': {
        '25-22': {}, // winning
      },
    },
  },
  '14-17': {
    '21x14': {
      '10x17': {
        '25-21': {},
      },
    },
  },
};

const DENNY_OPENING = {
  '6-10': {
    '22-17': {},
  },
  '7-10': {
    '28-24': {},
  },
  '9-13': {
    '22-18': {},
  },
  '11-15': {
    '19x10': {
      '6x15': {
        '22-18': {
          '15x22': {
            '26x17x10': {
              '7x14': {
                '28-24': {},
              },
            },
          },
        },
      },
    },
  },
  '11-16': {
    '28-24': {},
  },
  '12-16': {
    '19x12': {}, // winning
  },
  '14-17': {
    '21x14': {
      '9x18': {
        '23x14': {},
      },
    },
  },
  '14-18': {
    '22x15': {
      '11x18': {
        '23x14': {
          '9x18': {
            '26-23': {},
          },
        },
      },
    },
    '23x14': {
      '9x18': {
        '22x15': {
          '11x18': {
            '26-23': {},
          },
        },
      },
    },
  },
};

const KELSO_OPENING = {
  '6-10': {
    '17-13': {},
  },
  '7-10': {
    '17-14': {
      '9x18': {
        '23x14x7': {
          '3x10': {
            '26x23': {}, // winning
          },
        },
      },
      '10x17': {},
    },
  },
  '9-13': {
    '17-14': {},
  },
  '9-14': {
    '17x10': {
      '7x14': {
        '22-18': {
          '15x22': {
            '26x17x10': {
              '6x15': {
                '25x22': {}, // winning
              },
            },
          },
        },
      },
    },
  },
  '11-16': {
    '17-14': {},
  },
  '12-16': {
    '24-19': {}, // winning
  },
  '15-18': {
    '22x15': {
      '11x18': {
        '23x14': {
          '9x18': {
            '24-19': {},
          },
        },
      },
    },
    '23x14': {
      '9x18': {
        '22x15': {
          '11x18': {
            '24-19': {},
          },
        },
      },
    },
  },
  '15-19': {
    '24x15': {
      '11x18': {
        '22x15': {},
      },
    },
  },
};

const OLD_FAITHFUL_OPENING = {
  '7-11': {
    '18-15': {},
  },
  '8-11': {
    '29-25': {},
  },
  '9-13': {
    '29-25': {},
  },
  '9-14': {
    '18x9': {
      '5x14': {
        '29-25': {},
      },
      '6x13': {
        '29-25': {},
      },
    },
  },
  '10-14': {
    '24-19': {},
  },
  '10-15': {
    '18x11': {
      '7x16': {
        '29-25': {},
      },
      '8x15': {
        '21-17': {},
      },
    },
  },
  '12-16': {
    '18-14': {},
  },
};

const BRISTOL_OPENING = {
  '7-11': {
    '25-22': {},
  },
  '8-11': {
    '18-14': {},
  },
  '9-13': {
    '18-14': {},
  },
  '9-14': {
    '18x9': {
      '5x14': {
        '24-19': {},
      },
      '6x13': {
        '25-22': {}, // winning
      },
    },
  },
  '10-14': {
    '26-22': {},
  },
  '10-15': {
    '18x11': {
      '8x15': {
        '24-20': {},
      },
    },
  },
  '16-19': {
    '23x16': {
      '12x19': {
        '24x15': {
          '10x19': {
            '21-17': {},
          },
        },
      },
    },
    '24x15': {
      '10x19': {
        '23x16': {
          '12x19': {
            '21-17': {},
          },
        },
      },
    },
  },
  '16-20': {
    '25-22': {},
  },
};

const DUNDEE_OPENING = {
  '8-12': {
    '28-24': {},
  },
  '9-13': {
    '22-18': {},
  },
  '9-14': {
    '23-18': {},
  },
  '10-14': {
    '23-18': {},
  },
  '10-15': {
    '22-18': {
      '15x22': {
        '25x18': {},
      },
    },
  },
  '11-15': {
    '20x11': {
      '7x16': {
        '22-18': {
          '15x22': {
            '25x18': {},
          },
        },
      },
    },
  },
};

export const AI_SECOND_OPENING = {
  '9-13': {
    '22-18': EDINBURGH_OPENING,
  },
  '9-14': {
    '22-18': DOUBLE_CORNER_OPENING,
  },
  '10-14': {
    '24-19': DENNY_OPENING,
  },
  '10-15': {
    '21-17': KELSO_OPENING,
  },
  '11-15': {
    '22-18': {
      '15x22': {
        '25x18': OLD_FAITHFUL_OPENING,
      },
    },
  },
  '11-16': {
    '22-18': BRISTOL_OPENING,
  },
  '12-16': {
    '24-20': DUNDEE_OPENING,
  },
};